# Fluxo de publicação (RWF)

O módulo **Fluxo de publicação** adiciona uma **governança de alterações baseada em ramos** ao panorama de EA. Todas as alterações são propostas num *ramo* com nome, revistas por um arquiteto e integradas no panorama ativo apenas após aprovação.

!!! note
    O módulo Fluxo de publicação pode ser ativado ou desativado por um administrador nas [Configurações](../admin/settings.md). Quando desativado, o item de navegação «Releases» e todos os pontos de acesso de ramos ficam ocultos.

## Visão geral

| Conceito | Descrição |
|----------|-----------|
| **Ramo** | Um ambiente isolado com nome. Cartões, relações e diagramas podem ser editados em completo isolamento do panorama ativo |
| **Área de trabalho** | A vista com âmbito de ramo (separadores: Cartões, Relações, Diagramas) |
| **Diff** | Comparação campo a campo entre o rascunho do ramo e o panorama ativo, com deteção de conflitos |
| **Fusão** | Aplicação das alterações do ramo ao panorama ativo após aprovação |
| **Instantâneo** | Cópia imutável do panorama completo num determinado momento, usada como referência |

### A garantia de isolamento

**Os ramos não afetam nenhuma vista existente.** Relatórios, BPM, PPM, GRC, TurboLens, diagramas, o inventário e os detalhes dos cartões mostram sempre o panorama ativo.

## Permissões

| Permissão | Para quem | O que permite |
|----------|----------|---------------|
| `rwf.view` | Todos os utilizadores que devem ver os ramos | Ler a lista de ramos, a vista diff e a lista de instantâneos |
| `rwf.contribute` | Contribuidores | Criar ramos, editar cartões/relações/diagramas num ramo, submeter para revisão |
| `rwf.approve` | Arquitetos EA / revisores | Aprovar, rejeitar e fundir ramos no panorama ativo |

## Ciclo de vida de um ramo

```
aberto  →  em revisão  →  aprovado  →  fundido
                      ↘  rejeitado  ↗
                      ↘  abandonado
```

## Criar um ramo

1. Navegue para **Releases → Ramos**.
2. Clique em **Novo ramo**.
3. Introduza um nome e uma descrição opcional e clique em **Criar ramo**.

## Trabalhar na área de trabalho

Abra um ramo e clique em **Abrir área de trabalho**. A área de trabalho tem três separadores:

### Separador Cartões

Mostra todos os cartões visíveis neste ramo com o seu estado de alteração (Novo / Modificado / Eliminado). Clique num cartão para abrir o painel de detalhes com âmbito de ramo.

### Separador Relações

Mostra todas as relações visíveis neste ramo com o seu estado de alteração.

### Separador Diagramas

Lista todas as substituições de diagramas VisualFirst neste ramo. Clicar numa linha abre o editor VisualFirst completo em modo ramo.

## Submeter para revisão

Abra a página de detalhes do ramo e clique em **Submeter para revisão**. Todos os utilizadores com `rwf.approve` recebem uma notificação.

## Rever e aprovar

1. Navegue para **Releases → Ramos** e selecione o ramo em revisão.
2. Clique em **Ver alterações** para ver o diff completo.
3. Clique em **Aprovar** ou **Rejeitar** (com um comentário opcional).

## Fundir no panorama ativo

Após a aprovação, clique em **Fundir no principal**. Se houver conflitos, aparece uma caixa de diálogo de resolução.

## Reversão

Os ramos fundidos suportam uma ação **Reverter fusão** que restaura o estado anterior.

!!! warning
    A reversão não pode ser desfeita.

## Instantâneos

Os instantâneos são cópias imutáveis e com nome do panorama completo num determinado momento.

1. Navegue para **Releases → Ramos → separador Instantâneos**.
2. Clique em **Novo instantâneo**, introduza um nome e clique em **Criar instantâneo**.
3. Clique em **Ver alterações** para ver o que mudou desde esse instantâneo.
