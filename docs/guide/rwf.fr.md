# Workflow de publication (RWF)

Le module **Workflow de publication** ajoute une **gouvernance des modifications basée sur les branches** au paysage EA. Toutes les modifications sont proposées dans une *branche* nommée, examinées par un architecte et intégrées dans le paysage actif uniquement après approbation.

!!! note
    Le module Workflow de publication peut être activé ou désactivé par un administrateur dans les [Paramètres](../admin/settings.md). Lorsqu'il est désactivé, l'élément de navigation «&nbsp;Releases&nbsp;» et tous les points d'accès aux branches sont masqués.

## Vue d'ensemble

| Concept | Description |
|---------|-------------|
| **Branche** | Un bac à sable nommé. Les cartes, relations et diagrammes peuvent être modifiés en isolation totale du paysage actif |
| **Espace de travail** | La vue scopée à la branche (onglets : Cartes, Relations, Diagrammes) |
| **Diff** | Comparaison champ par champ entre le brouillon de branche et le paysage actif, avec détection des conflits |
| **Fusion** | Application des modifications de la branche au paysage actif après approbation |
| **Instantané** | Copie immuable du paysage complet à un instant donné, utilisée comme référence |

### La garantie d'isolation

**Les branches n'affectent aucune vue existante.** Les rapports, BPM, PPM, GRC, TurboLens, les diagrammes, l'inventaire et les détails des cartes affichent toujours le paysage actif.

## Autorisations

| Autorisation | Pour qui | Ce qu'elle permet |
|-------------|----------|------------------|
| `rwf.view` | Tous les utilisateurs devant voir les branches | Lire la liste des branches, la vue diff et la liste des instantanés |
| `rwf.contribute` | Contributeurs | Créer des branches, modifier cartes/relations/diagrammes dans une branche, soumettre pour révision |
| `rwf.approve` | Architectes EA / réviseurs | Approuver, rejeter et fusionner des branches dans le paysage actif |

## Cycle de vie d'une branche

```
ouverte  →  en révision  →  approuvée  →  fusionnée
                        ↘  rejetée     ↗
                        ↘  abandonnée
```

## Créer une branche

1. Naviguez vers **Releases → Branches**.
2. Cliquez sur **Nouvelle branche**.
3. Saisissez un nom et une description optionnelle, puis cliquez sur **Créer la branche**.

## Travailler dans l'espace de travail

Ouvrez une branche et cliquez sur **Ouvrir l'espace de travail**. L'espace de travail comporte trois onglets :

### Onglet Cartes

Affiche toutes les cartes visibles dans cette branche avec leur statut de modification (Nouveau / Modifié / Supprimé). Cliquez sur une carte pour ouvrir le panneau de détail scopé à la branche.

### Onglet Relations

Affiche toutes les relations visibles dans cette branche avec leur statut de modification.

### Onglet Diagrammes

Liste toutes les substitutions de diagrammes VisualFirst dans cette branche. Un clic sur une ligne ouvre l'éditeur VisualFirst complet en mode branche.

## Soumettre pour révision

Ouvrez la page de détail de la branche et cliquez sur **Soumettre pour révision**. Tous les utilisateurs avec `rwf.approve` reçoivent une notification.

## Réviser et approuver

1. Naviguez vers **Releases → Branches** et sélectionnez la branche en révision.
2. Cliquez sur **Afficher les modifications** pour voir le diff complet.
3. Cliquez sur **Approuver** ou **Rejeter** (avec un commentaire optionnel).

## Fusionner dans le paysage actif

Après approbation, cliquez sur **Fusionner dans le principal**. En cas de conflits, une boîte de dialogue de résolution apparaît.

## Retour arrière

Les branches fusionnées prennent en charge une action **Annuler la fusion** qui restaure l'état antérieur.

!!! warning
    Le retour arrière ne peut pas être annulé.

## Instantanés

Les instantanés sont des copies nommées et immuables du paysage complet à un instant donné.

1. Naviguez vers **Releases → Branches → onglet Instantanés**.
2. Cliquez sur **Nouvel instantané**, saisissez un nom et cliquez sur **Créer un instantané**.
3. Cliquez sur **Afficher les modifications** pour voir ce qui a changé depuis cet instantané.
