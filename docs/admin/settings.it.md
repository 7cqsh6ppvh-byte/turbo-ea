# Impostazioni generali

La pagina **Impostazioni** (**Admin > Impostazioni**) fornisce una configurazione centralizzata per l'aspetto, l'email e le attivazioni dei moduli della piattaforma.

![Impostazioni generali](../assets/img/it/28_admin_impostazioni_generali.png)

## Aspetto

### Logo

Caricate un logo personalizzato che appare nella barra di navigazione superiore. Formati supportati: PNG, JPEG, SVG, WebP, GIF. Cliccate su **Ripristina** per tornare al logo predefinito di Turbo EA.

### Favicon

Caricate un'icona personalizzata per il browser (favicon). La modifica ha effetto al prossimo caricamento della pagina. Cliccate su **Ripristina** per tornare all'icona predefinita.

### Valuta

Selezionate la valuta utilizzata per i campi costo in tutta la piattaforma. Questo influisce sulla formattazione dei valori di costo nelle pagine di dettaglio delle card, nei report e nelle esportazioni. Sono supportate oltre 20 valute, tra cui USD, EUR, GBP, JPY, CNY, CHF, INR, BRL e altre.

### Formato data

Scegli come vengono visualizzate le date in tutta l'applicazione. Il formato selezionato si applica alle date del ciclo di vita delle card, alla griglia inventario, alle firme di ADR e SoAW, al Registro dei rischi, ai report e alle attività PPM, alle versioni dei flussi di processo BPM, ai commenti, alla cronologia, al feed di attività della dashboard, alle notifiche e alle pagine di amministrazione. Vengono offerti cinque formati con anteprima in tempo reale:

- `MM/DD/YYYY` — stile USA (es. `04/29/2026`)
- `DD/MM/YYYY` — stile europeo (es. `29/04/2026`)
- `YYYY-MM-DD` — ISO 8601 (es. `2026-04-29`)
- `DD MMM YYYY` — predefinito (es. `29 apr 2026`)
- `MMM DD, YYYY` (es. `apr 29, 2026`)

Le modifiche hanno effetto immediato per tutti gli utenti — non è richiesto alcun ricaricamento.

### Lingue abilitate

Attivate/disattivate quali lingue sono disponibili per gli utenti nel selettore della lingua. Tutte e otto le localizzazioni supportate possono essere abilitate o disabilitate individualmente:

- English, Deutsch, Français, Español, Italiano, Português, 中文, Русский

Almeno una lingua deve rimanere abilitata in ogni momento.

### Inizio dell'anno fiscale

Selezionate il mese in cui inizia l'anno fiscale della vostra organizzazione (da gennaio a dicembre). Questa impostazione influisce sul raggruppamento delle **linee di budget** nel modulo PPM per anno fiscale. Ad esempio, se l'anno fiscale inizia ad aprile, una linea di budget di giugno 2026 appartiene all'AF 2026–2027.

Il valore predefinito è **gennaio** (anno solare = anno fiscale).

## Email (SMTP)

Configurate la consegna delle email per email di invito, notifiche dei sondaggi e altri messaggi di sistema.

| Campo | Descrizione |
|-------|-------------|
| **SMTP Host** | L'hostname del vostro server di posta (es. `smtp.gmail.com`) |
| **SMTP Port** | Porta del server (tipicamente 587 per TLS) |
| **SMTP User** | Nome utente per l'autenticazione |
| **SMTP Password** | Password per l'autenticazione (memorizzata crittografata) |
| **Usa TLS** | Abilita la crittografia TLS (consigliato) |
| **Indirizzo mittente** | L'indirizzo email del mittente per i messaggi in uscita |
| **URL base dell'app** | L'URL pubblico della vostra istanza Turbo EA (utilizzato nei link delle email) |

Dopo la configurazione, cliccate su **Invia email di test** per verificare che le impostazioni funzionino correttamente.

!!! note
    L'email è opzionale. Se SMTP non è configurato, le funzionalità che inviano email (inviti, notifiche dei sondaggi) salteranno la consegna via email in modo trasparente.

## Modulo BPM

Attivate/disattivate il modulo **Business Process Management**. Quando disabilitato:

- L'elemento di navigazione **BPM** è nascosto a tutti gli utenti
- Le card Business Process rimangono nel database ma le funzionalità specifiche del BPM (editor del flusso di processo, dashboard BPM, report BPM) non sono accessibili

Questo è utile per le organizzazioni che non utilizzano il BPM e desiderano un'esperienza di navigazione più pulita.

## Modulo PPM

Attivate/disattivate il modulo **Project Portfolio Management** (PPM). Quando disabilitato:

- L'elemento di navigazione **PPM** è nascosto a tutti gli utenti
- Le card Iniziativa rimangono nel database ma le funzionalità specifiche del PPM (report di stato, monitoraggio budget e costi, registro rischi, board delle attività, diagramma di Gantt) non sono accessibili

Quando abilitato, le card Iniziativa ottengono una scheda **PPM** nella vista di dettaglio e la dashboard del portfolio PPM diventa disponibile nella navigazione principale. Consultate [Project Portfolio Management](../guide/ppm.md) per la guida completa delle funzionalità.

## Modulo GRC

Attivate/disattivate il modulo **Governance, Rischio e Conformità** (GRC). Quando disabilitato:

- L'elemento di navigazione **GRC** è nascosto a tutti gli utenti
- Lo spazio `/grc` (Principi di Governance e ADR, Registro dei Rischi, finding di Conformità) non è raggiungibile e mostra il placeholder standard «modulo disabilitato» per chi arriva da un link diretto
- Le schede **Rischi** e **Conformità** nel dettaglio della card vengono nascoste, così le singole card non espongono più dati GRC
- I rischi e i finding di conformità rimangono nel database — i permessi sottostanti `risks.*` e `security_compliance.*` restano invariati, quindi i dati si conservano e ricompaiono invariati se il modulo viene riabilitato

Consultate la [guida GRC](../guide/grc.md) per il riferimento completo delle funzionalità.
