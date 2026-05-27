# Flujo de publicación (RWF)

El módulo **Flujo de publicación** añade una **gobernanza de cambios basada en ramas** al paisaje de EA. Todos los cambios se proponen en una *rama* con nombre, son revisados por un arquitecto y se integran en el paisaje activo solo tras su aprobación.

!!! note
    El módulo Flujo de publicación puede activarse o desactivarse por un administrador en [Configuración](../admin/settings.md). Cuando está desactivado, el elemento de navegación «Releases» y todos los puntos de acceso de las ramas quedan ocultos.

## Resumen

| Concepto | Descripción |
|----------|-------------|
| **Rama** | Un entorno aislado con nombre. Las tarjetas, relaciones y diagramas se pueden editar en completo aislamiento del paisaje activo |
| **Espacio de trabajo** | La vista con ámbito de rama (pestañas: Tarjetas, Relaciones, Diagramas) |
| **Diff** | Comparación campo a campo entre el borrador de rama y el paisaje activo, con detección de conflictos |
| **Fusión** | Aplicación de los cambios de la rama al paisaje activo tras la aprobación |
| **Instantánea** | Copia inmutable del paisaje completo en un momento determinado, usada como línea base |

### La garantía de aislamiento

**Las ramas no afectan ninguna vista existente.** Los informes, BPM, PPM, GRC, TurboLens, los diagramas, el inventario y los detalles de las tarjetas siempre muestran el paisaje activo.

## Permisos

| Permiso | Para quién | Qué permite |
|---------|-----------|-------------|
| `rwf.view` | Todos los usuarios que deban ver las ramas | Leer la lista de ramas, la vista diff y la lista de instantáneas |
| `rwf.contribute` | Colaboradores | Crear ramas, editar tarjetas/relaciones/diagramas en una rama, enviar para revisión |
| `rwf.approve` | Arquitectos EA / revisores | Aprobar, rechazar y fusionar ramas en el paisaje activo |

## Ciclo de vida de una rama

```
abierta  →  en revisión  →  aprobada  →  fusionada
                        ↘  rechazada  ↗
                        ↘  abandonada
```

## Crear una rama

1. Navegue a **Releases → Ramas**.
2. Haga clic en **Nueva rama**.
3. Escriba un nombre y una descripción opcional, luego haga clic en **Crear rama**.

## Trabajar en el espacio de trabajo

Abra una rama y haga clic en **Abrir espacio de trabajo**. El espacio de trabajo tiene tres pestañas:

### Pestaña Tarjetas

Muestra todas las tarjetas visibles en esta rama con su estado de cambio (Nuevo / Modificado / Eliminado). Haga clic en una tarjeta para abrir el panel de detalle con ámbito de rama.

### Pestaña Relaciones

Muestra todas las relaciones visibles en esta rama con su estado de cambio.

### Pestaña Diagramas

Lista todas las sustituciones de diagramas VisualFirst en esta rama. Al hacer clic en una fila se abre el editor completo de VisualFirst en modo rama.

## Enviar para revisión

Abra la página de detalle de la rama y haga clic en **Enviar para revisión**. Todos los usuarios con `rwf.approve` reciben una notificación.

## Revisar y aprobar

1. Navegue a **Releases → Ramas** y seleccione la rama en revisión.
2. Haga clic en **Ver cambios** para ver el diff completo.
3. Haga clic en **Aprobar** o **Rechazar** (con un comentario opcional).

## Fusionar en el paisaje activo

Tras la aprobación, haga clic en **Fusionar en principal**. Si hay conflictos, aparece un diálogo de resolución.

## Reversión

Las ramas fusionadas admiten una acción **Revertir fusión** que restaura el estado anterior.

!!! warning
    La reversión no se puede deshacer.

## Instantáneas

Las instantáneas son copias nombradas e inmutables del paisaje completo en un momento determinado.

1. Navegue a **Releases → Ramas → pestaña Instantáneas**.
2. Haga clic en **Nueva instantánea**, escriba un nombre y haga clic en **Crear instantánea**.
3. Haga clic en **Ver cambios** para ver qué ha cambiado desde esa instantánea.
