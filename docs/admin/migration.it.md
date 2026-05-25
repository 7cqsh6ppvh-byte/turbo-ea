# Migrazione di piattaforma

> Piattaforme sorgente supportate oggi: **SAP LeanIX**. Adattatori aggiuntivi (Ardoq, Mega HOPEX, BiZZdesign, Avolution Abacus, …) si collegano alla stessa pipeline di staging e applicazione e compaiono automaticamente nella finestra di dialogo di caricamento quando vengono rilasciati.

L'importatore di migrazione di piattaforma (**Amministrazione → Impostazioni → Migrazione**) acquisisce un workspace LeanIX completo e lo deposita come carte, relazioni, tag, stakeholder, documenti, commenti e un metamodello completamente costruito di Turbo EA in un'unica operazione a fasi, revisionabile.

## A chi è rivolto?

Ai clienti che migrano da LeanIX (SAP LeanIX) a Turbo EA. L'importatore accetta la cartella di lavoro xlsx **Full Snapshot** di LeanIX — l'export multi-foglio con un foglio per tipo di fact sheet, un foglio per tipo di relazione, più `TagGroups`, `Tags`, `Documents`, `Comments`, `Types` e un foglio di riferimento `ReadMe`. I caricamenti in altri formati vengono rifiutati già al momento dell'upload con un messaggio di errore chiaro.

## Come ottenere l'esportazione

In LeanIX, aprire **Administration → Export → Full Snapshot**. Questa azione produce una singola cartella XLSX contenente tutte le fact sheet **attive**, le loro relazioni, i gruppi di tag, i tag, i documenti (chiamati *resources* in LeanIX) e i commenti.

**Le fact sheet archiviate non sono incluse** nel Full Snapshot — ripristinatele prima in LeanIX se desiderate che approdino in Turbo EA.

## Il flusso di lavoro

1. **Caricare** lo snapshot in **Impostazioni → Migrazione → Nuova migrazione**. Il file resta sul disco del server; il database memorizza solo i metadati. Il parsing viene eseguito in background e lo stato passa automaticamente da `uploaded → parsed`.

2. **Revisionare** ogni tipo di entità nella vista a tab. Ogni riga staged porta un'azione:
    - `create` — sarà aggiunta a Turbo EA
    - `update` — esiste già; i campi del diff saranno uniti
    - `skip` — esiste già senza modifiche
    - `conflict` — endpoint mancante, tipo non mappato o collisione con un built-in — vedere la colonna *Note* per il motivo

    I tab **Nuovi tipi**, **Campi personalizzati** e **Nuove relazioni** mostrano il metamodello personalizzato del tenant dal vostro workspace LeanIX. Per default sono accettati così come sono e creano tipi di carta / campi / tipi di relazione non-built-in corrispondenti in Turbo EA. Per un controllo più fine, modificate la chiave/etichetta/tipo proposti nel JSON dello staged record prima di applicare.

3. **Applicare** quando siete soddisfatti. La pipeline di apply esegue 12 passate ordinate per dipendenze (tipi del metamodello → campi del metamodello → tipi di relazione del metamodello → utenti → carte → gruppi di tag → tag → collegamenti carta-tag → relazioni → sottoscrizioni → documenti → commenti) dentro savepoint individuali — una riga fallita non avvelena il resto dell'import. Lo stato passa da `applying → applied` (o `failed` se gli errori superano la soglia di sicurezza).

## Cosa viene importato

| LeanIX | Turbo EA |
|---|---|
| Application, ITComponent, Business Capability, Business Context, Process, DataObject, Interface, Provider, TechCategory, Platform, Objective, Project / Initiative | Mappatura diretta 1:1 del tipo di carta |
| User Group | Organization con sottotipo `team`, taggata `leanix_origin=UserGroup` |
| Fasi del ciclo di vita (plan / phaseIn / active / phaseOut / endOfLife) | Riportate letteralmente su `cards.lifecycle` |
| Gerarchia (`childParentRelation`) | Ripiegata in `Card.parent_id` |
| Archi Successor/Predecessor (`*SuccessorRelation`) | Memorizzati come relazioni; la direzione viene invertita in import per allineare la convenzione di Turbo EA «source succede a target» alla semantica LeanIX «X ha successore Y». I nuovi tipi di carta del tenant hanno `has_successors=true` così che la vista di lineage venga renderizzata. |
| Relazioni (50+ tipi di archi predefiniti LeanIX, sia in notazione xlsx `applicationITComponentRelation` che GraphQL `relApplicationToITComponent`) | Relazioni native Turbo EA con attributi di arco |
| Tipi di relazione definiti dal tenant (Server↔Application, lxSystem*, lxDora*, microservice*, ESG*, etc.) | Nuove righe `relation_types` non-built-in, create automaticamente nello stesso passaggio di import affinché ogni arco effettivamente atterri |
| Tag (gruppi single/multi) | Gruppi di tag + tag + join per carta |
| Sottoscrizioni (una per ruolo RESPONSIBLE/OBSERVER) | Righe stakeholder; utenti auto-creati disattivati (`is_active=false`) |
| Documenti (URL) | Allegati documento |
| Commenti (top-level + risposte, appiattiti) | Righe commenti |
| Tipi di fact sheet personalizzati del tenant (es. `ESGCapability`, `Server`, `System`, `TechPlatform`, `TechnicalStack`) | Nuovi tipi di carta non-built-in con `has_hierarchy=true`, `has_successors=true` e una sezione `Imported from LeanIX` pre-popolata |
| Campi personalizzati del tenant | Aggiunti al `fields_schema` del tipo target sotto una sezione sintetica `Imported from LeanIX`. Tipo di campo e lista **completa** delle opzioni enum sono estratti dal foglio `ReadMe` della cartella di lavoro — `currentMaturity` atterra come single-select con tutti i 5 valori (`adHoc, repeatable, defined, managed, optimized`) anche quando i dati ne usano solo uno |
| Tipi di relazione personalizzati del tenant | Nuovi tipi di relazione non-built-in, con tipi di endpoint tradotti tramite la mappa LX↔TEA (`UserGroup → Organization`, etc.) |

### Perché il foglio ReadMe è importante

Il primo foglio del xlsx (`ReadMe`) è il riferimento autoritativo dei campi di LeanIX: ogni colonna documentata con il suo tipo (`String`, `Integer`, `Percent`, `Datetime`, `Boolean`, `String list`) e, quando applicabile, il vincolo enum completo (`Possible values: one of A, B, C.`). L'importatore legge questo foglio per primo e lo usa come fonte primaria di verità per i metadati dei campi — ricorrendo al foglio in-data `Types` solo quando la ReadMe non copre una colonna. È la differenza tra un campo importato come input di testo libero e un vero dropdown con le opzioni corrette.

## Cosa **non** viene importato

Lo snapshot non contiene questi elementi — l'importatore segnala il mancante nella colonna *Note* per riga:

- **File binari dei documenti** — solo le URL sono nello snapshot; l'importatore crea documenti tipo link. Ricaricare i binari manualmente.
- **Threading dei commenti** — le risposte sono appiattite a commenti top-level per preservare il testo; i padri di thread richiederebbero metadati di UI LeanIX assenti dallo snapshot.
- **Password utente e binding SSO** — gli utenti auto-creati atterrano disattivati. Invitarli o collegarli a SSO successivamente.
- **Cronologia di audit** precedente all'import — la cronologia Turbo EA inizia dal timestamp di apply.
- **Diagrammi / poster / dashboard / ricerche salvate / preferenze di notifica / token API / webhook** — nessun equivalente in Turbo EA o nessun analogo nello snapshot.

## Riesecuzione di un import

L'idempotenza è integrata. La tabella `migration_identity_map` registra la corrispondenza UUID LeanIX → Turbo EA per ogni entità importata. Un re-upload dello stesso snapshot (o di uno snapshot aggiornato dello stesso workspace) rileva le entità esistenti e scrive righe staged `update`/`skip` invece di duplicare `create`. Il campo `external_id` della carta porta il `factSheetId` LeanIX, quindi il collegamento sopravvive anche se la identity map viene cancellata.

Se dovete rifare un import (es. cancellazione in blocco delle carte importate dalla UI e volete reinserirle), usate l'icona cestino sulla riga della migrazione per eliminarla, poi ricaricate. Le migrazioni `applied` sono eliminabili; ciò rilascia il lock di idempotenza per hash file, permettendo di ricaricare lo stesso snapshot. Le righe orfane in `migration_identity_map` che puntano a carte inesistenti vengono potate automaticamente al prossimo passaggio di staging — non è mai richiesta una pulizia manuale della identity map.

## Permesso

Questa pagina è protetta dal permesso `admin.migrate`. Per default solo il ruolo **admin** lo possiede; concedetelo esplicitamente ad altri ruoli in **Impostazioni → Ruoli** se volete che un non-admin pilotare la migrazione.

## Limitazioni da considerare

- **Una migrazione in corso per hash file.** Ricaricare gli stessi byte mentre una migrazione per quell'hash è ancora attiva restituisce il record di migrazione esistente (l'hash SHA-256 è la chiave naturale di idempotenza). Eliminate prima il record di migrazione se volete davvero un nuovo import dello stesso file.
- **Workspace grandi** (10k+ fact sheet): il parser è in streaming, ma la pipeline di apply scrive righe in una transazione per passata. Pianificate ~15 minuti per import molto grandi.
- **Campi, valori e tag personalizzati sono tollerati, non pre-mappati.** Qualsiasi colonna LeanIX non presente nel metamodello built-in di Turbo EA atterra verbatim nella mappa `attributes` della carta importata ed appare nel tab **Campi personalizzati** affinché un admin possa promuoverla. Lo stesso per i gruppi di tag definiti dal tenant e i tipi di relazione aggiunti dai clienti LeanIX (es. `lxSystemSystem*`, `*Lx*Dora*`, `microservice*`, `eSGCapability*`) — appaiono invariati nei tab **Nuovi tipi** / **Nuove relazioni**, pronti per una decisione dell'admin.

## Pulizia

Eliminare un record di migrazione (Impostazioni → Migrazione → icona cestino) rimuove sia le righe DB per quella migrazione (gli staged record cascadeano) che il file snapshot su disco. Le migrazioni negli stati `uploaded`, `parsed`, `previewed`, `failed`, `aborted` e `applied` sono tutte eliminabili; una migrazione `applying` deve prima terminare (o fallire) prima di poter essere rimossa.
