# Integración MCP (acceso para herramientas de IA)

Turbo EA incluye un **servidor MCP** (Model Context Protocol) integrado que permite a herramientas de IA — como Claude Desktop, GitHub Copilot, Cursor y VS Code — consultar y actualizar los datos de EA directamente. Las herramientas de IA también pueden cargar artefactos (hojas de cálculo, diagramas BPMN, diagramas DrawIO, documentos libres) y convertirlos en fichas, relaciones y diagramas que encajan en el metamodelo existente. Los usuarios se autentican a través de su proveedor SSO existente, y cada acción respeta sus permisos individuales.

Esta función es **opcional** y **no se inicia automáticamente**. Requiere que SSO esté configurado, que el perfil MCP esté activado en Docker Compose y que un administrador lo active en la interfaz de configuración.

---

## Cómo funciona

```
Herramienta de IA (Claude, Copilot, etc.)
    │
    │  Protocolo MCP (HTTP + SSE)
    ▼
Servidor MCP de Turbo EA (:8001, interno)
    │
    │  OAuth 2.1 con PKCE
    │  delega al proveedor SSO
    ▼
Backend de Turbo EA (:8000)
    │
    │  RBAC por usuario
    ▼
PostgreSQL
```

1. Un usuario agrega la URL del servidor MCP a su herramienta de IA.
2. En la primera conexión, la herramienta abre una ventana del navegador para la autenticación SSO.
3. Tras el inicio de sesión, el servidor MCP emite su propio token de acceso (respaldado por el JWT del usuario en Turbo EA).
4. La herramienta de IA usa este token para todas las solicitudes posteriores. Los tokens se renuevan automáticamente.
5. Cada consulta pasa por el sistema de permisos normal de Turbo EA — los usuarios solo ven los datos a los que tienen acceso.

---

## Requisitos previos

Antes de habilitar MCP, debe tener:

- **SSO configurado y funcionando** — MCP delega la autenticación a su proveedor SSO (Microsoft Entra ID, Google Workspace, Okta o OIDC genérico). Consulte la guía de [Autenticación y SSO](sso.md).
- **HTTPS con un dominio público** — El flujo OAuth requiere una URI de redirección estable. Despliegue detrás de un proxy inverso con terminación TLS (Caddy, Traefik, Cloudflare Tunnel, etc.).

---

## Configuración

### Paso 1: Iniciar el servicio MCP

El servidor MCP es un perfil opcional de Docker Compose. Agregue `--profile mcp` a su comando de inicio:

```bash
docker compose --profile mcp up --build -d
```

Esto inicia un contenedor Python ligero (puerto 8001, solo interno) junto al backend y frontend. Nginx redirige automáticamente las solicitudes `/mcp/` hacia él.

### Paso 2: Configurar variables de entorno

Agregue estas a su archivo `.env`:

```dotenv
TURBO_EA_PUBLIC_URL=https://su-dominio.ejemplo.com
MCP_PUBLIC_URL=https://su-dominio.ejemplo.com/mcp
```

| Variable | Predeterminado | Descripción |
|----------|---------------|-------------|
| `TURBO_EA_PUBLIC_URL` | `http://localhost:8920` | La URL pública de su instancia de Turbo EA |
| `MCP_PUBLIC_URL` | `http://localhost:8920/mcp` | La URL pública del servidor MCP (usada en URIs de redirección OAuth) |
| `MCP_PORT` | `8001` | Puerto interno del contenedor MCP (raramente necesita cambio) |

### Paso 3: Agregar la URI de redirección OAuth a su aplicación SSO

En el registro de aplicación de su proveedor SSO (el mismo que configuró para el inicio de sesión de Turbo EA), agregue esta URI de redirección:

```
https://su-dominio.ejemplo.com/mcp/oauth/callback
```

Esto es necesario para el flujo OAuth que autentica a los usuarios cuando se conectan desde su herramienta de IA.

### Paso 4: Habilitar MCP en la configuración de administrador

1. Vaya a **Configuración** en el área de administración y seleccione la pestaña **IA**.
2. Desplácese hasta la sección **Integración MCP (Acceso a herramientas IA)**.
3. Active el interruptor para **habilitar** MCP.
4. La interfaz mostrará la URL del servidor MCP e instrucciones de configuración para compartir con su equipo.

!!! warning
    El interruptor está deshabilitado si SSO no está configurado. Configure SSO primero.

---

## Conectar herramientas de IA

Una vez habilitado MCP, comparta la **URL del servidor MCP** con su equipo. Cada usuario la agrega a su herramienta de IA:

### Claude Desktop

1. Abra **Configuración > Conectores > Agregar conector personalizado**.
2. Ingrese la URL del servidor MCP: `https://su-dominio.ejemplo.com/mcp`
3. Haga clic en **Conectar** — se abre una ventana del navegador para el inicio de sesión SSO.
4. Tras la autenticación, Claude puede consultar sus datos de EA.

### VS Code (GitHub Copilot / Cursor)

Agregue a su `.vscode/mcp.json` del espacio de trabajo:

```json
{
  "servers": {
    "turbo-ea": {
      "type": "http",
      "url": "https://su-dominio.ejemplo.com/mcp/mcp"
    }
  }
}
```

El doble `/mcp/mcp` es intencional — el primer `/mcp/` es la ruta del proxy Nginx, el segundo es el punto de acceso del protocolo MCP.

---

## Prueba local (modo stdio)

Para desarrollo local o pruebas sin SSO/HTTPS, puede ejecutar el servidor MCP en **modo stdio** — Claude Desktop lo inicia directamente como proceso local.

**1. Instalar el paquete del servidor MCP:**

```bash
pip install ./mcp-server
```

**2. Agregar a la configuración de Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "turbo-ea": {
      "command": "python",
      "args": ["-m", "turbo_ea_mcp", "--stdio"],
      "env": {
        "TURBO_EA_URL": "http://localhost:8000",
        "TURBO_EA_EMAIL": "su@correo.com",
        "TURBO_EA_PASSWORD": "su-contraseña"
      }
    }
  }
}
```

En este modo, el servidor se autentica con correo/contraseña y renueva el token automáticamente en segundo plano.

---

## Capacidades disponibles

El servidor MCP expone **30 herramientas** repartidas en dos grupos: **25 herramientas de lectura** que consultan datos de EA y **5 herramientas de escritura** que convierten artefactos que una herramienta de IA tiene en su propio contexto (hojas de cálculo, BPMN XML, DrawIO XML, documentos, imágenes) en fichas, relaciones y diagramas.

### Seguridad mediante ejecución en seco en las escrituras

Cada herramienta de escritura usa por defecto **`dry_run=true`**. En este modo, el backend ejecuta cada validador y resolutor, construye el plan completo y luego **revierte la transacción**, de modo que nada se persiste. La herramienta de IA devuelve la vista previa al usuario; solo después de una confirmación explícita debe volver a llamar a la herramienta con `dry_run=false` para confirmar. Esto evita que un agente entusiasta inserte silenciosamente cientos de fichas a partir de una hoja de cálculo mal interpretada.

### Herramientas de lectura

El servidor expone 25 herramientas de lectura agrupadas en seis clusters.

**Fichas y metamodelo**

| Herramienta | Descripción |
|-------------|-------------|
| `search_cards` | Buscar y filtrar fichas por tipo, estado o texto libre |
| `get_card` | Obtener detalles completos de una ficha por UUID |
| `get_card_relations` | Obtener todas las relaciones conectadas a una ficha |
| `get_card_hierarchy` | Obtener ancestros e hijos de una ficha |
| `list_card_types` | Listar todos los tipos de ficha del metamodelo |
| `get_relation_types` | Listar tipos de relación, opcionalmente filtrados por tipo de ficha |

**Paneles**

| Herramienta | Descripción |
|-------------|-------------|
| `get_dashboard` | Panel de KPIs (conteos, calidad de datos, aprobaciones, actividad) |
| `get_landscape` | Fichas de un tipo agrupadas por un tipo relacionado |

**GRC — Registro de riesgos**

| Herramienta | Descripción |
|-------------|-------------|
| `list_risks` | Listado paginado y filtrable del registro de riesgos EA (TOGAF Fase G) |
| `get_risk` | Detalle de un riesgo con fichas vinculadas y pista de auditoría |
| `get_risk_metrics` | KPIs + matrices 4×4 inicial y residual |
| `get_card_risks` | Todos los riesgos vinculados a una ficha |

**GRC — Cumplimiento**

| Herramienta | Descripción |
|-------------|-------------|
| `list_compliance_findings` | Hallazgos de cumplimiento agrupados por regulación |
| `get_compliance_overview` | Puntuaciones de cumplimiento + matriz de estado por regulación + metadatos del último escaneo |

**Gobernanza y entrega**

| Herramienta | Descripción |
|-------------|-------------|
| `list_principles` | Principios EA publicados (declaración, justificación, implicaciones) |
| `list_adrs` | Architecture Decision Records, filtrables por iniciativa / estado |
| `get_adr` | ADR individual con secciones, fichas vinculadas y trazado de firmas |
| `list_soaws` | Statements of Architecture Work de una iniciativa |

**Informes**

| Herramienta | Descripción |
|-------------|-------------|
| `get_portfolio_report` | Datos de gráfico de burbujas para un tipo de ficha (por defecto: ajuste funcional × técnico) |
| `get_cost_treemap` | Mapa de árbol de costes, opcionalmente agrupado por un tipo relacionado |
| `get_capability_heatmap` | Mapa de calor jerárquico de capacidades de negocio |
| `get_data_quality_report` | Desglose de completitud por tipo de ficha |

**Contexto de ficha**

| Herramienta | Descripción |
|-------------|-------------|
| `get_card_stakeholders` | Usuarios + roles asignados a la ficha |
| `get_card_comments` | Hilo de comentarios de una ficha |
| `get_card_documents` | Enlaces a documentos adjuntos a una ficha (URL, no archivos) |

Todas las herramientas respetan el RBAC del usuario autenticado — una visualizadora recibirá simplemente una lista vacía (o 403) para lo que no puede ver; no hace falta configurar nada por herramienta a nivel MCP.

### Herramientas de escritura — carga de artefactos

Cinco herramientas permiten a un agente de IA convertir artefactos en datos EA estructurados. El agente lee el archivo origen en su propio contexto (visión multimodal, archivos adjuntos), extrae filas estructuradas y llama a estas herramientas. El servidor MCP en sí mismo nunca analiza archivos — espera entrada ya estructurada.

| Herramienta | Descripción |
|-------------|-------------|
| `create_cards_bulk` | Crea varias fichas en una sola llamada (por ejemplo, filas de hoja de cálculo). Admite referencias al padre por nombre dentro del mismo lote, con ordenación topológica en el servidor. |
| `resolve_card_refs` | Prevalida referencias basadas en nombre antes de una importación masiva — útil para mostrar al usuario padres ambiguos o ausentes. |
| `upsert_relations_bulk` | Crea o elimina relaciones entre fichas. Origen / destino / tipo se validan contra el metamodelo. |
| `create_diagram` | Crea un diagrama libre DrawIO con vínculos opcionales a fichas existentes. |
| `import_bpmn` | Guarda un diagrama BPMN 2.0 XML contra una ficha de Proceso de negocio **existente**. Si no hay ficha con el nombre indicado, la herramienta devuelve un error `card_not_found` que dirige al agente a `create_cards_bulk` — esto obliga a crear la ficha explícitamente con descripción, subtipo y atributos antes, en vez de tomar un atajo que deja una ficha pobre. |

Flujo típico cuando un usuario comparte una hoja de cálculo con el agente de IA:

1. El agente llama a `list_card_types` y `get_relation_types` para entender el metamodelo.
2. El agente analiza la hoja de cálculo (en su propio contexto, no en MCP) y construye diccionarios de fila.
3. El agente llama a `create_cards_bulk(cards=…, dry_run=True)` y muestra la vista previa al usuario.
4. El usuario confirma; el agente vuelve a llamar con `dry_run=False` para confirmar.
5. Si hay columnas de relación, el agente llama después a `upsert_relations_bulk` con el mismo ciclo ejecución en seco / confirmación.

### Salvaguardas de las herramientas de escritura

Defensa en profundidad sobre la ejecución en seco, para que un descuido del LLM no pueda causar daños masivos:

- **Límite de tamaño por llamada.** Las herramientas de escritura MCP aplican un límite mucho menor que los endpoints subyacentes del importador de Excel: 200 filas para `create_cards_bulk`, 500 operaciones para `upsert_relations_bulk`. Suficientemente grandes para cualquier carga realista de un artefacto, suficientemente pequeñas para que una vista previa de ejecución en seco siga siendo revisable.
- **Sin eliminación de relaciones por defecto.** `upsert_relations_bulk` rechaza operaciones `action: "delete"` — para eliminar relaciones, use la interfaz web donde la acción queda registrada bajo la identidad del usuario. Los operadores pueden activarlo estableciendo `MCP_ALLOW_RELATION_DELETE=true`.
- **Interruptor de apagado.** `MCP_WRITES_ENABLED=false` desactiva las cinco herramientas de escritura sin redesplegar código. Las 25 herramientas de lectura siguen funcionando.
- **Etiqueta de origen para auditoría.** Cada solicitud al backend desde el servidor MCP lleva un encabezado `X-Turbo-EA-Origin: mcp`. Los eventos emitidos desde esas solicitudes se etiquetan con `origin: "mcp"` en el payload del registro de auditoría, de modo que los administradores pueden filtrar las escrituras impulsadas por MCP de la línea de tiempo, separadas de las acciones de la interfaz web.
- **Sin herramientas de destrucción masiva.** El conjunto de herramientas omite deliberadamente el borrado, el archivado y la actualización masiva de fichas. Añadir cualquiera de estas herramientas requeriría una revisión de diseño explícita.

Las cuatro variables de entorno de salvaguarda en el contenedor MCP:

| Variable | Por defecto | Efecto |
|----------|-------------|--------|
| `MCP_WRITES_ENABLED` | `true` | Interruptor maestro de las herramientas de escritura. `false` → MCP de solo lectura. |
| `MCP_MAX_CARDS_PER_CALL` | `200` | Límite estricto de filas `create_cards_bulk` por solicitud. |
| `MCP_MAX_RELATIONS_PER_CALL` | `500` | Límite estricto de operaciones `upsert_relations_bulk` por solicitud. |
| `MCP_ALLOW_RELATION_DELETE` | `false` | Cuando es `true`, `upsert_relations_bulk` acepta operaciones `action: "delete"`. |

### Recursos

| URI | Descripción |
|-----|-------------|
| `turbo-ea://types` | Todos los tipos de ficha del metamodelo |
| `turbo-ea://relation-types` | Todos los tipos de relación |
| `turbo-ea://dashboard` | KPIs del panel y estadísticas resumidas |

### Prompts guiados

| Prompt | Descripción |
|--------|-------------|
| `analyze_landscape` | Análisis paso a paso: resumen del panel, tipos, relaciones |
| `find_card` | Buscar una ficha por nombre, obtener detalles y relaciones |
| `explore_dependencies` | Mapear de qué depende una ficha y qué depende de ella |

---

## Permisos

| Rol | Acceso |
|-----|--------|
| **Administrador** | Configurar ajustes MCP (permiso `admin.mcp`). Acceso completo de lectura + escritura a través de MCP. |
| **Todos los usuarios autenticados** | Acceso de lectura regido por su RBAC existente. Las herramientas de escritura requieren los permisos backend correspondientes — `inventory.create` (fichas), `relations.manage` (relaciones), `diagrams.manage` (diagramas), `bpm.edit` (BPMN). |

El permiso `admin.mcp` controla quién puede gestionar la configuración de MCP. Solo está disponible para el rol de Administrador por defecto. Los roles personalizados pueden recibir este permiso a través de la página de administración de Roles.

El acceso a datos a través de MCP — lectura o escritura — sigue el mismo modelo RBAC que la interfaz web. Si un usuario no puede crear fichas en la interfaz de inventario, tampoco puede crearlas a través de MCP; no hay permisos de datos específicos de MCP.

---

## Seguridad

- **Autenticación delegada por SSO**: Los usuarios se autentican a través de su proveedor SSO corporativo. El servidor MCP nunca ve ni almacena contraseñas.
- **OAuth 2.1 con PKCE**: El flujo de autenticación utiliza Proof Key for Code Exchange (S256) para prevenir la interceptación de códigos de autorización.
- **RBAC por usuario**: Cada acción MCP — lectura o escritura — se ejecuta con los permisos del usuario autenticado. Sin cuentas de servicio compartidas.
- **Ejecución en seco por defecto en escrituras**: Las herramientas de escritura ofrecen por defecto una vista previa de validar-y-revertir. La herramienta de IA debe volver a llamar explícitamente con `dry_run=false` antes de que se persista cualquier dato, y cada cambio queda auditado bajo la identidad del usuario.
- **Sin análisis de archivos en MCP**: El servidor MCP en sí mismo no acepta PDF, archivos Excel, imágenes ni otros artefactos binarios. La herramienta de IA que llama los analiza en su propio contexto y envía filas estructuradas. Esto mantiene la superficie de ataque reducida y evita exponer el servidor a entradas binarias malformadas.
- **Rotación de tokens**: Los tokens de acceso expiran después de 1 hora. Los tokens de renovación duran 30 días. Los códigos de autorización son de un solo uso y expiran después de 10 minutos.
- **Puerto solo interno**: El contenedor MCP expone el puerto 8001 solo en la red interna de Docker. Todo acceso externo pasa por el proxy inverso Nginx.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| El interruptor MCP está deshabilitado en la configuración | SSO debe estar configurado primero. Vaya a Configuración > pestaña Autenticación y configure un proveedor SSO. |
| «host not found» en los registros de Nginx | El servicio MCP no está en ejecución. Inícielo con `docker compose --profile mcp up -d`. La configuración de Nginx maneja esto de forma elegante (respuesta 502, sin caída). |
| La devolución de llamada OAuth falla | Verifique que agregó `https://su-dominio.ejemplo.com/mcp/oauth/callback` como URI de redirección en el registro de su aplicación SSO. |
| La herramienta de IA no puede conectarse | Verifique que `MCP_PUBLIC_URL` coincide con la URL accesible desde la máquina del usuario. Asegúrese de que HTTPS funciona. |
| El usuario obtiene resultados vacíos | MCP respeta los permisos RBAC. Si un usuario tiene acceso restringido, solo verá las fichas que su rol permite. |
| La conexión se interrumpe después de 1 hora | La herramienta de IA debería manejar la renovación de tokens automáticamente. Si no, reconecte. |
