# GRC

Il modulo **GRC** riunisce Governance, Rischio e Conformità in un unico spazio di lavoro a `/grc`. Consolida attività che prima vivevano tra Consegna EA e TurboLens, in modo che un'architetta, un proprietario di rischio e un revisore di conformità lavorino su un terreno comune.

!!! note
    Il modulo GRC può essere abilitato o disabilitato da un amministratore nelle [Impostazioni](../admin/settings.md). Quando disabilitato, la navigazione e le funzionalità GRC sono nascoste.

GRC ha tre schede:

Puoi puntare direttamente a una scheda con `/grc?tab=governance`, `/grc?tab=risk` o `/grc?tab=compliance`.

![GRC — scheda Governance](../assets/img/it/52_grc_governance.png)

## Governance

La scheda Governance si divide in due **sotto-schede**, deep-linkabili tramite `/grc?tab=governance&sub=principles` (predefinita) e `/grc?tab=governance&sub=decisions`:

### Principi

Visualizzatore in sola lettura dei Principi EA pubblicati nel metamodello (enunciato, motivazione, implicazioni). Il catalogo si modifica da **Amministrazione → Metamodello → Principi**.

### Decisioni

![GRC — sotto-scheda Decisioni](../assets/img/it/52a_grc_decisioni.png)

La sotto-scheda Decisioni è il **registro principale degli Architecture Decision Records (ADR)** — ogni ADR a livello di landscape, indipendentemente dall'iniziativa a cui è collegato. Sostituisce la vecchia scheda Decisioni di EA Delivery, dissolta con l'arrivo del modulo GRC.

Gli ADR documentano importanti decisioni architetturali insieme al loro contesto, alle conseguenze e alle alternative considerate. Le decisioni emesse dalla procedura guidata TurboLens Architect arrivano qui come bozze da approvare.

#### Colonne della tabella

La griglia ADR rispecchia il layout della griglia Inventario:

| Colonna | Descrizione |
|---------|-------------|
| **N. rif.** | Numero di riferimento generato automaticamente (ADR-001, ADR-002, …) |
| **Titolo** | Titolo dell'ADR |
| **Stato** | Chip colorato — Bozza, In Revisione o Firmato |
| **Card collegate** | Pillole colorate corrispondenti al colore del tipo di ogni card collegata |
| **Creato** | Data di creazione |
| **Modificato** | Data di ultima modifica |
| **Firmato** | Data di firma |
| **Revisione** | Numero di revisione |

#### Barra laterale dei filtri

La barra laterale dei filtri persistente a sinistra offre:

- **Tipi di card** — caselle di controllo con punti colorati che filtrano per tipi di card collegate
- **Stato** — Bozza / In Revisione / Firmato
- **Data di creazione / modifica / firma** — intervalli di date da/a

Usate la barra del **filtro rapido** per la ricerca full-text. Fate clic destro su una riga per un menu contestuale (**Modifica**, **Anteprima**, **Duplica**, **Elimina**).

#### Creare un ADR

Gli ADR possono essere creati da tre punti — tutti aprono lo stesso editor e alimentano lo stesso registro:

1. **GRC → Governance → Decisioni**: cliccate su **+ Nuovo ADR**, compilate il titolo e opzionalmente collegate card (incluse le iniziative).
2. **Spazio di lavoro EA Delivery**: selezionate un'iniziativa, cliccate su **+ Nuovo artefatto ▾** in alto (oppure **+ Aggiungi** nella sezione *Decisioni di Architettura*) e scegliete **Nuova Decisione di Architettura** — l'iniziativa è pre-collegata.
3. **Card → scheda Risorse**: cliccate su **Crea ADR** — la card corrente è pre-collegata.

In tutti i casi potete cercare e collegare card aggiuntive durante la creazione. Le iniziative sono collegate attraverso lo stesso meccanismo di collegamento di card di qualsiasi altra card, quindi un ADR può fare riferimento a più iniziative. L'editor si apre con sezioni per **Contesto**, **Decisione**, **Conseguenze** e **Alternative considerate**.

#### L'editor ADR

L'editor fornisce:

- Editing di testo ricco per ogni sezione (Contesto, Decisione, Conseguenze, Alternative considerate)
- Collegamento di card — collegate l'ADR alle card pertinenti (applicazioni, componenti IT, iniziative, …). Le iniziative sono collegate tramite la funzionalità standard di collegamento di card, non tramite un campo dedicato, consentendo a un ADR di fare riferimento a più iniziative
- Decisioni correlate — fate riferimento ad altri ADR

#### Workflow di firma

Gli ADR supportano un processo formale di firma:

1. Create l'ADR con stato **Bozza**.
2. Cliccate su **Richiedi firme** e cercate i firmatari per nome o e-mail.
3. L'ADR passa a **In Revisione** — ogni firmatario riceve una notifica e un Todo.
4. I firmatari esaminano e cliccano su **Firma**.
5. Quando tutti i firmatari hanno firmato, l'ADR passa automaticamente allo stato **Firmato**.

Gli ADR firmati sono bloccati e non possono essere modificati — per apportare modifiche create una nuova revisione.

#### Revisioni

Aprite un ADR firmato e cliccate su **Revisiona** per creare una nuova bozza basata sulla versione firmata. La nuova revisione eredita il contenuto e i collegamenti delle card e riceve un numero di revisione incrementale. Ogni revisione conserva la propria traccia di firma.

#### Anteprima

Cliccate sull'icona di anteprima per visualizzare una versione in sola lettura e formattata dell'ADR — utile per la revisione prima della firma.

## Rischio

![GRC — Registro dei rischi](../assets/img/it/53_grc_registro_rischi.png)

Incorpora il **Registro dei rischi** TOGAF Fase G. Ciclo di vita completo, workflow degli stati, interruttori della matrice e comportamento dei proprietari sono documentati nella [guida del Registro dei rischi](risks.md). I punti più rilevanti:

## Conformità

![GRC — scanner di conformità](../assets/img/it/54_grc_conformita.png)

Lo scanner di sicurezza on-demand, con due metà indipendenti:

I riscontri sono **durevoli tra re-scansioni** — decisioni utente, note di revisione, il verdetto AI dell'utente su una card e il rimando a un Rischio promosso sopravvivono alle scansioni successive. Un riscontro che la passata seguente non riporta più viene marcato `auto_resolved` e nascosto per default; il Rischio promosso in precedenza resta intatto per non rompere il percorso di audit.

La griglia Conformità riflette quella dell'Inventario: barra laterale dei filtri con visibilità delle colonne, ordinamento persistito, ricerca a testo libero e un cassetto di dettaglio che mostra il ciclo di vita di conformità come una timeline orizzontale di fasi:

```
new → in_review → mitigated → verified
                      ↘ accepted          (motivazione richiesta)
                      ↘ not_applicable    (revisione dell'ambito)
                      ↘ risk_tracked      (impostato automaticamente alla promozione a Rischio)
```

Con `security_compliance.manage`, spunta la casella nell'header per una **selezione filtrata di tutte le righe**, poi usa la barra degli strumenti agganciata per **Modifica decisione** (transizione in batch) o **Elimina** i riscontri selezionati. Le transizioni illegali sono segnalate riga per riga in un riepilogo di successo parziale, così una singola riga errata non fa fallire l'intero batch. Vedi [TurboLens → Sicurezza & Conformità](turbolens.md#bulk-actions-on-the-compliance-grid) per il riferimento completo delle azioni.

Quando un Rischio promosso da un riscontro viene chiuso o accettato, l'operazione **si propaga automaticamente al riscontro** — la riga di conformità collegata passa a `mitigated` / `verified` / `accepted` / `in_review` per restare sincronizzata, senza manutenzione manuale.

### Conformità su una singola card

Le card nell'ambito di una scansione di conformità espongono anche una scheda **Conformità** nella loro pagina di dettaglio (governata da `security_compliance.view`). Elenca ogni riscontro attualmente collegato alla card con le stesse azioni Riconosci / Accetta / **Crea rischio** / **Apri rischio** della vista GRC — così che un Application Owner possa triagiare i propri riscontri senza lasciare la card. La stessa regola di auto-nascondimento vale per la scheda **Rischi** nel dettaglio della card: entrambe le schede compaiono solo quando la card ha effettivamente elementi collegati, così le card senza attività GRC non si portano dietro schede vuote.

## Permessi

| Permesso | Ruoli predefiniti |
|----------|-------------------|
| `grc.view` | admin, bpm_admin, member, viewer |
| `grc.manage` | admin, bpm_admin, member |
| `risks.view` / `risks.manage` | vedi [Registro dei rischi § Permessi](risks.md) |
| `security_compliance.view` / `security_compliance.manage` | vedi [TurboLens § Security & Compliance](turbolens.md) |

`grc.view` controlla la visibilità della rotta GRC stessa — senza di esso, la voce del menu superiore è nascosta. Ogni scheda inoltre impone il proprio permesso di dominio, così che una visualizzatrice possa leggere il registro senza poter avviare una scansione LLM, ad esempio.
