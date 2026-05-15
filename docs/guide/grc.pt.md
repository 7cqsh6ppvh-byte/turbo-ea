# GRC

O módulo **GRC** reúne Governança, Risco e Conformidade num único espaço de trabalho em `/grc`. Consolida tarefas que antes viviam entre Entrega EA e TurboLens, para que arquitetas, proprietários de risco e revisores de conformidade trabalhem sobre um terreno comum.

!!! note
    O módulo GRC pode ser habilitado ou desabilitado por um administrador em [Configurações](../admin/settings.md). Quando desabilitado, a navegação e os recursos do GRC ficam ocultos.

GRC tem três abas:

Você pode apontar diretamente para qualquer aba via `/grc?tab=governance`, `/grc?tab=risk` ou `/grc?tab=compliance`.

![GRC — aba Governança](../assets/img/pt/52_grc_governanca.png)

## Governança

A aba Governança divide-se em duas **sub-abas**, com link profundo via `/grc?tab=governance&sub=principles` (padrão) e `/grc?tab=governance&sub=decisions`:

### Princípios

Visualizador somente leitura dos Princípios EA publicados no metamodelo (declaração, justificativa, implicações). O catálogo é editado em **Administração → Metamodelo → Princípios**.

### Decisões

![GRC — sub-aba Decisões](../assets/img/pt/52a_grc_decisoes.png)

A sub-aba Decisões é o **registro principal dos Architecture Decision Records (ADR)** — cada ADR ao longo do panorama, independentemente da iniciativa à qual está vinculado. Substitui a antiga aba Decisões de Entregas de EA, dissolvida quando o módulo GRC entrou em cena.

Os ADR documentam decisões de arquitetura importantes junto com seu contexto, consequências e alternativas consideradas. As decisões emitidas pelo assistente TurboLens Architect chegam aqui como rascunhos para aprovação.

#### Colunas da tabela

A grade de ADR espelha o layout da grade de Inventário:

| Coluna | Descrição |
|--------|-----------|
| **N.º de ref.** | Número de referência gerado automaticamente (ADR-001, ADR-002, …) |
| **Título** | Título do ADR |
| **Status** | Chip colorido — Rascunho, Em Revisão ou Assinado |
| **Cards vinculados** | Pílulas coloridas correspondentes à cor do tipo de cada card vinculado |
| **Criado** | Data de criação |
| **Modificado** | Data da última modificação |
| **Assinado** | Data de assinatura |
| **Revisão** | Número de revisão |

#### Barra lateral de filtros

A barra lateral de filtros persistente à esquerda oferece:

- **Tipos de card** — caixas de seleção com pontos coloridos que filtram por tipos de cards vinculados
- **Status** — Rascunho / Em Revisão / Assinado
- **Data de criação / modificação / assinatura** — intervalos de datas de/até

Use a barra de **filtro rápido** para pesquisa de texto completo. Clique com o botão direito em qualquer linha para um menu de contexto (**Editar**, **Pré-visualizar**, **Duplicar**, **Excluir**).

#### Criar um ADR

Os ADR podem ser criados a partir de três locais — todos abrem o mesmo editor e alimentam o mesmo registro:

1. **GRC → Governança → Decisões**: clique em **+ Novo ADR**, preencha o título e opcionalmente vincule cards (incluindo iniciativas).
2. **Espaço de trabalho de Entregas de EA**: selecione uma iniciativa, clique em **+ Novo artefato ▾** no cabeçalho da página (ou **+ Adicionar** na secção *Decisões de Arquitetura*) e escolha **Nova Decisão de Arquitetura** — a iniciativa fica pré-vinculada.
3. **Card → aba Recursos**: clique em **Criar ADR** — o card atual fica pré-vinculado.

Em todos os casos você pode pesquisar e vincular cards adicionais durante a criação. As iniciativas são vinculadas através do mesmo mecanismo de vinculação de cards de qualquer outro card, de modo que um ADR pode referenciar múltiplas iniciativas. O editor abre com seções para **Contexto**, **Decisão**, **Consequências** e **Alternativas Consideradas**.

#### O Editor de ADR

O editor oferece:

- Edição de texto rico para cada seção (Contexto, Decisão, Consequências, Alternativas Consideradas)
- Vinculação de cards — conecte o ADR a cards relevantes (aplicações, componentes de TI, iniciativas, …). As iniciativas são vinculadas através da vinculação padrão de cards, não por um campo dedicado, permitindo que um ADR referencie múltiplas iniciativas
- Decisões relacionadas — referencie outros ADR

#### Fluxo de Assinatura

Os ADR suportam um processo formal de assinatura:

1. Crie o ADR no status **Rascunho**.
2. Clique em **Solicitar Assinaturas** e pesquise signatários por nome ou e-mail.
3. O ADR passa para **Em Revisão** — cada signatário recebe uma notificação e uma tarefa.
4. Os signatários revisam e clicam em **Assinar**.
5. Quando todos os signatários assinarem, o ADR passa automaticamente para o status **Assinado**.

ADR assinados ficam bloqueados e não podem ser editados — para mudanças crie uma nova revisão.

#### Revisões

Abra um ADR assinado e clique em **Revisar** para criar um novo rascunho baseado na versão assinada. A nova revisão herda o conteúdo e os vínculos de cards e recebe um número de revisão incremental. Cada revisão mantém o seu próprio rastro de assinaturas.

#### Pré-visualização

Clique no ícone de pré-visualização para ver uma versão somente leitura e formatada do ADR — útil para revisão antes de assinar.

## Risco

![GRC — Registro de riscos](../assets/img/pt/53_grc_registo_riscos.png)

Incorpora o **Registro de riscos** TOGAF Fase G. Ciclo de vida completo, fluxo de status, alternadores da matriz e comportamento dos proprietários estão documentados no [guia do Registro de riscos](risks.md). Os pontos mais relevantes:

## Conformidade

![GRC — scanner de conformidade](../assets/img/pt/54_grc_conformidade.png)

O scanner de segurança sob demanda, com duas metades independentes:

As conclusões são **duráveis entre re-varreduras** — decisões da usuária, notas de revisão, o veredicto de IA do usuário sobre um card e o vínculo de volta a um Risco promovido sobrevivem às varreduras subsequentes. Uma conclusão que a próxima passagem não relatar mais é marcada `auto_resolved` e ocultada por padrão; o Risco previamente promovido é preservado para não romper a trilha de auditoria.

A grade de Conformidade espelha a do Inventário: barra lateral de filtros com visibilidade de colunas, ordenação persistida, busca de texto completo e uma gaveta de detalhes que mostra o ciclo de vida de conformidade como uma linha do tempo horizontal de fases:

```
new → in_review → mitigated → verified
                      ↘ accepted          (requer justificativa)
                      ↘ not_applicable    (revisão de escopo)
                      ↘ risk_tracked      (definido automaticamente ao promover para Risco)
```

Com `security_compliance.manage`, marque a caixa do cabeçalho para uma **seleção-tudo filtrada**, e então use a barra de ferramentas fixa para **Editar decisão** (transição em lote) ou **Excluir** as conclusões selecionadas. Transições ilegais são relatadas linha a linha em um resumo de sucesso parcial, de modo que uma única linha ruim não faça o lote inteiro falhar. Veja [TurboLens → Segurança & Conformidade](turbolens.md#bulk-actions-on-the-compliance-grid) para a referência completa de ações.

Quando um Risco promovido a partir de uma conclusão é fechado ou aceito, a ação **se propaga de volta para a conclusão automaticamente** — a linha de conformidade vinculada muda para `mitigated` / `verified` / `accepted` / `in_review` para permanecer em sincronia, sem manutenção manual.

### Conformidade em um único card

Os cards no escopo de uma varredura de conformidade também expõem uma aba **Conformidade** em sua página de detalhe (governada por `security_compliance.view`). Ela lista cada conclusão atualmente vinculada ao card com as mesmas ações Reconhecer / Aceitar / **Criar risco** / **Abrir risco** que a visão GRC — para que um Application Owner possa triar suas conclusões sem sair do card. A mesma regra de auto-ocultar vale para a aba **Riscos** no detalhe do card: ambas as abas só aparecem quando o card realmente tem itens vinculados, de modo que cards sem atividade de GRC não carregam abas vazias.

## Permissões

| Permissão | Papéis padrão |
|-----------|---------------|
| `grc.view` | admin, bpm_admin, member, viewer |
| `grc.manage` | admin, bpm_admin, member |
| `risks.view` / `risks.manage` | ver [Registro de riscos § Permissões](risks.md) |
| `security_compliance.view` / `security_compliance.manage` | ver [TurboLens § Security & Compliance](turbolens.md) |

`grc.view` controla a visibilidade da própria rota GRC — sem ele, a entrada do menu superior fica oculta. Cada aba ainda impõe sua própria permissão de domínio, de modo que uma visualizadora possa ler o registro sem poder disparar uma varredura LLM, por exemplo.
