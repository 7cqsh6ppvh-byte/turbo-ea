# Flusso di pubblicazione (RWF)

Il modulo **Flusso di pubblicazione** aggiunge una **governance delle modifiche basata su rami** al paesaggio EA. Tutte le modifiche vengono proposte in un *ramo* con nome, revisionate da un architetto e integrate nel paesaggio attivo solo dopo l'approvazione.

!!! note
    Il modulo Flusso di pubblicazione può essere attivato o disattivato da un amministratore nelle [Impostazioni](../admin/settings.md). Se disattivato, l'elemento di navigazione «Releases» e tutti gli endpoint dei rami vengono nascosti.

## Panoramica

| Concetto | Descrizione |
|----------|-------------|
| **Ramo** | Un ambiente isolato con nome. Schede, relazioni e diagrammi possono essere modificati in completo isolamento dal paesaggio attivo |
| **Area di lavoro** | La vista con ambito di ramo (schede: Schede, Relazioni, Diagrammi) |
| **Diff** | Confronto campo per campo tra la bozza del ramo e il paesaggio attivo, con rilevamento dei conflitti |
| **Unione** | Applicazione delle modifiche del ramo al paesaggio attivo dopo l'approvazione |
| **Istantanea** | Copia immutabile dell'intero paesaggio in un determinato momento, usata come riferimento |

### La garanzia di isolamento

**I rami non influenzano nessuna vista esistente.** Report, BPM, PPM, GRC, TurboLens, diagrammi, inventario e dettagli delle schede mostrano sempre il paesaggio attivo.

## Autorizzazioni

| Autorizzazione | Per chi | Cosa consente |
|---------------|---------|---------------|
| `rwf.view` | Tutti gli utenti che devono vedere i rami | Leggere l'elenco dei rami, la vista diff e l'elenco delle istantanee |
| `rwf.contribute` | Contributori | Creare rami, modificare schede/relazioni/diagrammi in un ramo, inviare per revisione |
| `rwf.approve` | Architetti EA / revisori | Approvare, rifiutare e unire rami nel paesaggio attivo |

## Ciclo di vita di un ramo

```
aperto  →  in revisione  →  approvato  →  unito
                        ↘  rifiutato   ↗
                        ↘  abbandonato
```

## Creare un ramo

1. Naviga in **Releases → Rami**.
2. Clicca su **Nuovo ramo**.
3. Inserisci un nome e una descrizione opzionale, poi clicca su **Crea ramo**.

## Lavorare nell'area di lavoro

Apri un ramo e clicca su **Apri area di lavoro**. L'area di lavoro ha tre schede:

### Scheda Schede

Mostra tutte le schede visibili in questo ramo con il loro stato di modifica (Nuovo / Modificato / Eliminato). Clicca su una scheda per aprire il pannello dei dettagli con ambito di ramo.

### Scheda Relazioni

Mostra tutte le relazioni visibili in questo ramo con il loro stato di modifica.

### Scheda Diagrammi

Elenca tutte le sostituzioni di diagrammi VisualFirst in questo ramo. Un clic su una riga apre l'editor VisualFirst completo in modalità ramo.

## Inviare per revisione

Apri la pagina dei dettagli del ramo e clicca su **Invia per revisione**. Tutti gli utenti con `rwf.approve` ricevono una notifica.

## Rivedere e approvare

1. Naviga in **Releases → Rami** e seleziona il ramo in revisione.
2. Clicca su **Visualizza modifiche** per vedere il diff completo.
3. Clicca su **Approva** o **Rifiuta** (con un commento opzionale).

## Unire nel paesaggio attivo

Dopo l'approvazione, clicca su **Unisci nel principale**. Se ci sono conflitti, appare una finestra di risoluzione.

## Rollback

I rami uniti supportano un'azione **Annulla unione** che ripristina lo stato precedente.

!!! warning
    Il rollback non può essere annullato.

## Istantanee

Le istantanee sono copie immutabili e con nome dell'intero paesaggio in un determinato momento.

1. Naviga in **Releases → Rami → scheda Istantanee**.
2. Clicca su **Nuova istantanea**, inserisci un nome e clicca su **Crea istantanea**.
3. Clicca su **Visualizza modifiche** per vedere cosa è cambiato da quell'istantanea.
