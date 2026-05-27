# Release-Workflow (RWF)

Das Modul **Release-Workflow** fügt der EA-Landschaft eine **branchbasierte Änderungssteuerung** hinzu. Alle Änderungen werden in einem benannten *Branch* vorgeschlagen, von einem Architekten geprüft und erst nach Genehmigung in die Live-Landschaft übernommen.

!!! note
    Das Release-Workflow-Modul kann von einem Administrator unter [Einstellungen](../admin/settings.md) aktiviert oder deaktiviert werden. Bei Deaktivierung werden der Navigationsbereich „Releases" und alle Branch-Endpunkte ausgeblendet.

## Übersicht

Der Release-Workflow ist an Git-Branching und das Release-Workflow-Konzept von ADOIT angelehnt:

| Konzept | Beschreibung |
|---------|--------------|
| **Branch** | Eine benannte Sandbox. Karten, Relationen und Diagramme können vollständig isoliert von der Live-Landschaft bearbeitet werden |
| **Workspace** | Die branch-spezifische Ansicht (Reiter: Karten, Relationen, Diagramme), in der Mitarbeitende Änderungen vornehmen |
| **Diff** | Ein feldgenauer Vergleich zwischen dem Branch-Entwurf und der aktuellen Live-Landschaft, einschließlich Konflikterkennung |
| **Merge** | Übernahme der Branch-Änderungen in die Live-Landschaft nach Genehmigung |
| **Snapshot** | Eine unveränderliche Momentaufnahme der gesamten Landschaft, die als Basislinie für Vergleiche dient |

### Die Isolationsgarantie

**Branches beeinflussen keine bestehenden Ansichten.** Berichte, BPM, PPM, GRC, TurboLens, Diagramme, das Inventar und die Kartendetails zeigen stets die Live-Landschaft. Branch-Daten sind nur im dedizierten Branch-Workspace sichtbar.

## Berechtigungen

| Berechtigung | Wer sie benötigt | Was sie ermöglicht |
|-------------|------------------|--------------------|
| `rwf.view` | Alle Benutzer, die Branches sehen sollen | Branch-Liste, Diff-Ansicht und Snapshot-Liste lesen |
| `rwf.contribute` | Mitarbeitende | Branches erstellen, Karten/Relationen/Diagramme im Branch bearbeiten, zur Prüfung einreichen |
| `rwf.approve` | EA-Architekten / Prüfer | Branches genehmigen, ablehnen und in die Live-Landschaft mergen |

Die vorinstallierte Rolle **EA-Architekt** hat alle drei Berechtigungen. Administratoren haben standardmäßig alle Berechtigungen.

## Branch-Lebenszyklus

```
offen  →  in Prüfung  →  genehmigt  →  gemergt
                     ↘  abgelehnt    ↗  (als neuer Branch wieder öffnen)
                     ↘  aufgegeben
```

| Status | Beschreibung |
|--------|--------------|
| **Offen** | Branch ist bearbeitbar; Mitarbeitende können Karten, Relationen und Diagramme hinzufügen, ändern oder löschen |
| **In Prüfung** | Zur Prüfung eingereicht; Workspace ist schreibgeschützt; Architekten erhalten eine Benachrichtigung |
| **Genehmigt** | Von einem Architekten genehmigt; bereit zum Mergen |
| **Gemergt** | Alle Änderungen wurden in die Live-Landschaft übernommen |
| **Abgelehnt** | Mit einem Kommentar an den Mitarbeitenden zurückgegeben |
| **Aufgegeben** | Dauerhaft geschlossen ohne Merge |

## Einen Branch erstellen

1. Navigieren Sie zu **Releases → Branches**.
2. Klicken Sie auf **Neuer Branch**.
3. Geben Sie einen Namen und eine optionale Beschreibung ein und klicken Sie auf **Branch erstellen**.

## Im Workspace arbeiten

Öffnen Sie einen Branch und klicken Sie auf **Workspace öffnen**. Der Workspace hat drei Reiter:

### Reiter Karten

Zeigt alle im Branch sichtbaren Karten — die Live-Landschaft überlagert mit Branch-Überschreibungen. Jede Zeile zeigt die Art der Änderung (Neu / Geändert / Gelöscht).

Klicken Sie auf eine Karte, um das branch-spezifische Detailpanel zu öffnen und Name, Beschreibung und benutzerdefinierte Attribute zu bearbeiten.

### Reiter Relationen

Zeigt alle im Branch sichtbaren Relationen mit Änderungsstatus.

### Reiter Diagramme

Listet alle VisualFirst-Diagramm-Überschreibungen im Branch auf. Ein Klick auf eine Zeile öffnet den vollständigen VisualFirst-Editor im branch-spezifischen Modus.

## Zur Prüfung einreichen

Wenn Ihre Änderungen abgeschlossen sind, öffnen Sie die Branch-Detailseite und klicken Sie auf **Zur Prüfung einreichen**. Alle Benutzer mit `rwf.approve` erhalten eine Benachrichtigung.

## Prüfen und genehmigen

1. Navigieren Sie zu **Releases → Branches** und wählen Sie den zu prüfenden Branch.
2. Klicken Sie auf **Änderungen anzeigen**, um den vollständigen Diff zu sehen.
3. Klicken Sie auf **Genehmigen** oder **Ablehnen** (mit optionalem Kommentar).

## In die Live-Landschaft mergen

Nach der Genehmigung klicken Sie auf **In Haupt mergen**. Bei Konflikten erscheint ein Auflösungsdialog, in dem Sie für jedes konfliktbehaftete Feld den Gewinner wählen.

## Rollback

Gemergten Branches unterstützen eine **Merge zurücksetzen**-Aktion, die alle Karten, Relationen und Diagramme in den Zustand vor dem Merge zurückversetzt.

!!! warning
    Ein Rollback kann nicht rückgängig gemacht werden.

## Snapshots

Snapshots sind benannte, unveränderliche Kopien der gesamten Landschaft zu einem bestimmten Zeitpunkt.

1. Navigieren Sie zu **Releases → Branches → Reiter Snapshots**.
2. Klicken Sie auf **Neuer Snapshot**, geben Sie einen Namen ein und klicken Sie auf **Snapshot erstellen**.
3. Klicken Sie auf **Änderungen anzeigen**, um zu sehen, was sich seit dem Snapshot in der Live-Landschaft geändert hat.
