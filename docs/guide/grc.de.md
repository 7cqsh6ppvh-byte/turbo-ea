# GRC

Das **GRC**-Modul vereint Governance, Risk und Compliance in einem gemeinsamen Arbeitsbereich unter `/grc`. Es bündelt Aufgaben, die zuvor zwischen EA-Bereitstellung und TurboLens verteilt waren, sodass Architektin, Risikoeigentümer und Compliance-Prüferin auf gemeinsamem Boden arbeiten.

!!! note
    Das GRC-Modul kann von einem Administrator in den [Einstellungen](../admin/settings.md) aktiviert oder deaktiviert werden. Wenn deaktiviert, sind GRC-Navigation und -Funktionen ausgeblendet.

GRC hat drei Reiter:

Du kannst jeden Reiter direkt verlinken: `/grc?tab=governance`, `/grc?tab=risk` oder `/grc?tab=compliance`.

![GRC — Governance-Reiter](../assets/img/de/52_grc_governance.png)

## Governance

Der Governance-Reiter teilt sich in zwei **Unter-Reiter** auf, deep-linkbar über `/grc?tab=governance&sub=principles` (Standard) und `/grc?tab=governance&sub=decisions`:

### Prinzipien

Schreibgeschützter Browser für die im Metamodell veröffentlichten EA-Prinzipien (Aussage, Begründung, Auswirkungen). Den Katalog bearbeitest du unter **Administration → Metamodell → Prinzipien**.

### Entscheidungen

![GRC — Entscheidungen-Unter-Reiter](../assets/img/de/52a_grc_entscheidungen.png)

Der Entscheidungen-Unter-Reiter ist das **zentrale Register der Architecture Decision Records (ADRs)** — jedes ADR im gesamten Landscape, unabhängig davon, mit welcher Initiative es verknüpft ist. Er löst den alten EA-Delivery-Reiter «Entscheidungen» ab, der mit dem GRC-Modul abgeschafft wurde.

ADRs dokumentieren wichtige Architekturentscheidungen samt Kontext, Konsequenzen und erwogenen Alternativen. Vom TurboLens-Architect-Wizard erzeugte Entscheidungen landen hier als Entwürfe für Reviewer.

#### Tabellenspalten

Das ADR-Grid orientiert sich am Layout des Inventar-Grids:

| Spalte | Beschreibung |
|--------|-------------|
| **Referenznr.** | Automatisch generierte Referenznummer (ADR-001, ADR-002, …) |
| **Titel** | ADR-Titel |
| **Status** | Farbiger Chip — Entwurf, In Überprüfung oder Unterschrieben |
| **Verknüpfte Karten** | Farbige Pillen passend zur Farbe des jeweiligen Kartentyps |
| **Erstellt** | Erstellungsdatum |
| **Geändert** | Datum der letzten Änderung |
| **Unterschrieben** | Datum der Unterschrift |
| **Revision** | Revisionsnummer |

#### Filterseitenleiste

Die dauerhafte Filterseitenleiste links bietet:

- **Kartentypen** — Kontrollkästchen mit farbigen Punkten zum Filtern nach verknüpften Kartentypen
- **Status** — Entwurf / In Überprüfung / Unterschrieben
- **Erstellungs-/Änderungs-/Unterschriftsdatum** — Von/Bis-Datumsbereich

Verwende die **Schnellfilter**-Suchleiste für die Volltextsuche über alle ADRs. Rechtsklick auf eine Zeile öffnet ein Kontextmenü (**Bearbeiten**, **Vorschau**, **Duplizieren**, **Löschen**).

#### Ein ADR erstellen

ADRs lassen sich von drei Stellen aus erstellen — alle öffnen denselben Editor und speisen dasselbe Register:

1. **GRC → Governance → Entscheidungen**: Klick auf **+ Neues ADR**, Titel ausfüllen und optional Karten (inkl. Initiativen) verknüpfen.
2. **EA-Delivery-Arbeitsbereich**: Initiative auswählen, dann **+ Neues Artefakt ▾** im Seitenkopf (oder **+ Hinzufügen** im Abschnitt *Architekturentscheidungen*) klicken und **Neue Architekturentscheidung** wählen — die Initiative wird vorab verknüpft.
3. **Karte → Reiter «Ressourcen»**: Klick auf **ADR erstellen** — die aktuelle Karte ist vorab verknüpft.

In allen Fällen können während der Erstellung weitere Karten gesucht und verknüpft werden. Initiativen werden über denselben Kartenverknüpfungsmechanismus wie jede andere Karte angebunden, sodass ein ADR mehrere Initiativen referenzieren kann. Der Editor öffnet sich mit Abschnitten für **Kontext**, **Entscheidung**, **Konsequenzen** und **Erwogene Alternativen**.

#### Der ADR-Editor

Der Editor bietet:

- Rich-Text-Bearbeitung für jeden Abschnitt (Kontext, Entscheidung, Konsequenzen, Erwogene Alternativen)
- Kartenverknüpfung — verbinde das ADR mit relevanten Karten (Anwendungen, IT-Komponenten, Initiativen, …). Initiativen werden über die Standard-Kartenverknüpfung verknüpft, nicht über ein eigenes Feld, sodass ein ADR mehrere Initiativen referenzieren kann
- Verwandte Entscheidungen — referenziere andere ADRs

#### Abzeichnungsworkflow

ADRs unterstützen einen formalen Abzeichnungsprozess:

1. ADR im Status **Entwurf** erstellen.
2. **Unterschriften anfordern** klicken und Unterzeichner nach Name oder E-Mail suchen.
3. Das ADR wechselt zu **In Überprüfung** — jeder Unterzeichner erhält eine Benachrichtigung und ein Todo.
4. Unterzeichner prüfen und klicken auf **Unterschreiben**.
5. Sobald alle unterschrieben haben, wechselt das ADR automatisch auf **Unterschrieben**.

Unterschriebene ADRs sind gesperrt und können nicht bearbeitet werden — für Änderungen wird eine neue Revision angelegt.

#### Revisionen

Ein unterschriebenes ADR öffnen und **Überarbeiten** klicken, um einen neuen Entwurf auf Basis der unterschriebenen Version zu erstellen. Die neue Revision erbt Inhalt und Kartenverknüpfungen und erhält eine fortlaufende Revisionsnummer. Jede Revision behält ihren eigenen Abzeichnungs-Pfad.

#### Vorschau

Klick auf das Vorschau-Symbol für eine schreibgeschützte, formatierte Ansicht des ADR — nützlich vor der Unterschrift.

## Risk

![GRC — Risikoregister](../assets/img/de/53_grc_risikoregister.png)

Bindet das **Risikoregister** gemäß TOGAF Phase G ein. Lebenszyklus, Statusworkflow, Matrix-Umschalter und Eigentümer-Verhalten sind im [Risikoregister-Leitfaden](risks.md) dokumentiert. Die wichtigsten Punkte:

## Compliance

![GRC — Compliance-Scanner](../assets/img/de/54_grc_compliance.png)

Der On-Demand-Sicherheitsscanner mit zwei unabhängigen Hälften:

Befunde sind **über Re-Scans hinweg dauerhaft** — Benutzerentscheidungen, Prüfnotizen, das KI-Verdikt des Nutzers auf einer Karte und der Rückverweis auf ein promotetes Risiko überleben spätere Scans. Ein Befund, den der nächste Lauf nicht mehr meldet, wird mit `auto_resolved` markiert und standardmäßig ausgeblendet; das zuvor promotete Risiko bleibt erhalten, damit der Audit-Pfad nicht abreißt.

Das Compliance-Grid spiegelt das Inventar-Grid: Filter-Sidebar mit Spaltensichtbarkeit, persistierter Sortierung, Volltextsuche und einer Detail-Schublade, die den Compliance-Lebenszyklus als horizontale Phasen-Timeline zeigt:

```
new → in_review → mitigated → verified
                      ↘ accepted          (Begründung erforderlich)
                      ↘ not_applicable    (Geltungsbereich-Review)
                      ↘ risk_tracked      (automatisch beim Überführen in Risiko)
```

Mit `security_compliance.manage` kannst du über das Header-Kontrollkästchen alle gefilterten Zeilen **gefiltert auswählen** und dann über die fixierte Symbolleiste **Entscheidung bearbeiten** (Batch-Übergang) oder **Löschen** anwenden. Illegale Übergänge werden zeilenweise in einer Teil-Erfolg-Zusammenfassung gemeldet, sodass eine einzelne fehlerhafte Zeile nicht den gesamten Batch scheitern lässt. Den vollständigen Aktionsreferenz findest du unter [TurboLens → Security & Compliance](turbolens.md#bulk-actions-on-the-compliance-grid).

Wenn ein aus einem Befund promotetes Risiko geschlossen oder akzeptiert wird, **propagiert das automatisch zurück auf den Befund** — die verknüpfte Compliance-Zeile wechselt entsprechend auf `mitigated` / `verified` / `accepted` / `in_review`, sodass beide Register ohne manuelle Pflege synchron bleiben.

### Compliance auf einer einzelnen Karte

Karten, die im Scope eines Compliance-Scans liegen, zeigen außerdem einen **Compliance**-Reiter auf ihrer Detailseite (durch `security_compliance.view` gesteuert). Er listet jeden Befund, der aktuell mit der Karte verknüpft ist, mit denselben Aktionen Acknowledge / Accept / **Risiko erstellen** / **Risiko öffnen** wie die GRC-Ansicht — sodass ein Application Owner seine Befunde triagieren kann, ohne die Karte zu verlassen. Dieselbe Regel gilt für den **Risiken**-Reiter in den Kartendetails: beide Reiter erscheinen nur, wenn die Karte tatsächlich verknüpfte Einträge hat, sodass Karten ohne GRC-Aktivität keine leeren Reiter mitschleppen.

## Berechtigungen

| Berechtigung | Standardrollen |
|--------------|----------------|
| `grc.view` | admin, bpm_admin, member, viewer |
| `grc.manage` | admin, bpm_admin, member |
| `risks.view` / `risks.manage` | siehe [Risikoregister § Berechtigungen](risks.md) |
| `security_compliance.view` / `security_compliance.manage` | siehe [TurboLens § Security & Compliance](turbolens.md) |

`grc.view` steuert die Sichtbarkeit der GRC-Route selbst — ohne diese Berechtigung wird der Eintrag im Top-Menü ausgeblendet. Jeder Reiter erzwingt zusätzlich seine domänenspezifische Berechtigung, sodass etwa eine Viewerin das Register lesen kann, ohne einen LLM-Scan auslösen zu dürfen.
