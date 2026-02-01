# TODO - Allineamento Frontend alle modifiche API

## Riferimento: Changelog API_DOCUMENTATION.md

---

## 1. Aggiornamento WorkStatus Enum e Tipo Work

**File:** `src/types/index.ts`

- [ ] Rinominare i valori dell'enum `WorkStatus`:
  - `PENDING` → `SCHEDULED`
  - `COMPLETED` → `CLOSED`
  - (invariati: `IN_PROGRESS`, `INVOICED`)
- [ ] Rimuovere i campi booleani deprecati dall'interfaccia `Work`:
  - `completed: boolean`
  - `completedAt?: string`
  - `invoiced: boolean`
  - `invoicedAt?: string`
- [ ] Aggiungere i nuovi campi:
  - `status: WorkStatus`
  - `statusChangedAt?: string`

---

## 2. Aggiornamento Helper getWorkStatus()

**File:** `src/components/ui/status-badge.tsx`

- [ ] Eliminare la funzione `getWorkStatus()` che deriva lo stato da `completed`/`invoiced`
- [ ] Usare direttamente il campo `status` dal backend (non serve piu' derivarlo)
- [ ] Aggiornare le chiavi di configurazione dello status badge:
  - `PENDING` → `SCHEDULED`
  - `COMPLETED` → `CLOSED`
- [ ] Aggiornare icone/colori se necessario per i nuovi nomi

---

## 3. Nuovo endpoint: Start Work

**File:** `src/lib/api.ts`, `src/hooks/api/useWorks.ts`

- [ ] Aggiungere `worksApi.start(id)` → `PATCH /works/{id}/start`
- [ ] Creare hook `useStartWork()` per la transizione SCHEDULED → IN_PROGRESS

---

## 4. Nuovo endpoint: Force Status (solo OWNER)

**File:** `src/lib/api.ts`, `src/hooks/api/useWorks.ts`

- [ ] Aggiungere `worksApi.forceStatus(id, status)` → `PATCH /works/{id}/force-status` con body `{ status }`
- [ ] Creare hook `useForceWorkStatus()`
- [ ] Nell'UI, mostrare questa opzione solo se l'utente ha ruolo `OWNER`

---

## 5. Aggiornamento Filtri Works

**File:** `src/pages/WorksPage.tsx`

- [ ] Rimuovere il filtro `completed: boolean` usato per distinguere tab "aperti"/"chiusi"
- [ ] Rimuovere il filtro `invoiced` dall'interfaccia `WorkFilters`
- [ ] Sostituire con filtri basati su `status` / `statuses` (array):
  - Tab "Aperti" → `statuses=SCHEDULED&statuses=IN_PROGRESS`
  - Tab "Chiusi" → `statuses=CLOSED&statuses=INVOICED`
  - (oppure usare un filtro singolo `status` per stato specifico)
- [ ] Aggiornare i parametri query inviati all'API in `worksApi.getAll()`

---

## 6. Aggiornamento WorksPage - UI

**File:** `src/pages/WorksPage.tsx`

- [ ] Aggiornare il badge di stato per usare `work.status` direttamente
- [ ] Rimuovere tutte le references a `work.completed` e `work.invoiced`
- [ ] Aggiornare le opzioni del filtro dropdown per riflettere i nuovi stati:
  - SCHEDULED, IN_PROGRESS, CLOSED, INVOICED

---

## 7. Aggiornamento WorkDetailPage - Logica Transizioni

**File:** `src/pages/WorkDetailPage.tsx`

- [ ] Refactoring `handleStatusChange()` per usare le nuove transizioni:
  - SCHEDULED → IN_PROGRESS: chiama `useStartWork()`
  - IN_PROGRESS → CLOSED: chiama `useCloseWork()`
  - IN_PROGRESS → SCHEDULED (rollback): chiama il nuovo endpoint o `useForceWorkStatus()`
  - CLOSED → INVOICED: chiama `useInvoiceWork()`
  - CLOSED → IN_PROGRESS (rollback): chiama `useReopenWork()`
- [ ] Rimuovere tutta la logica basata su `work.completed` / `work.invoiced`
- [ ] Usare `work.status` per determinare le azioni disponibili
- [ ] Aggiungere bottone "Avvia Lavoro" per transizione SCHEDULED → IN_PROGRESS
- [ ] Aggiornare il dropdown di stato in edit mode con i nuovi valori
- [ ] Per utenti OWNER: aggiungere opzione force-status (con conferma)

---

## 8. Gestione errore 409 Conflict

**File:** `src/hooks/api/useWorks.ts`, `src/pages/WorkDetailPage.tsx`

- [ ] Gestire il codice errore 409 nelle mutation di cambio stato
- [ ] Mostrare un messaggio specifico all'utente quando una transizione non e' valida
- [ ] Differenziare il messaggio di errore 409 da altri errori

---

## 9. Aggiornamento Dashboard

**File:** `src/lib/api.ts`, `src/pages/Dashboard.tsx`

- [ ] Aggiornare la query GraphQL: rimuovere `completed`/`invoiced`, usare `status`
- [ ] Aggiornare il fallback REST: filtrare per `status` invece di `w.completed`
  - `pendingWorks` → lavori con `status` SCHEDULED o IN_PROGRESS
  - `completedWorks` → lavori con `status` CLOSED o INVOICED
- [ ] Aggiornare le label del grafico se necessario

---

## 10. Aggiornamento i18n

**File:** `src/locales/en/works.json`, `src/locales/it/works.json`

- [ ] Aggiornare le chiavi dei badge:
  - Aggiungere `badges.scheduled` ("Scheduled" / "Programmato")
  - Rinominare `badges.completed` → `badges.closed` ("Closed" / "Chiuso")
  - Mantenere `badges.inProgress` e `badges.invoiced`
- [ ] Aggiornare le chiavi dei filtri:
  - Sostituire `filters.invoiced`/`filters.invoicedYes`/`filters.invoicedNo` con filtri per stato
  - Aggiungere opzioni per ogni stato: SCHEDULED, IN_PROGRESS, CLOSED, INVOICED
- [ ] Aggiornare le chiavi dei dialogs:
  - `dialogs.markCompletedTitle/Description` → aggiornare terminologia a "Chiudi lavoro"
  - Aggiungere `dialogs.startWorkTitle/Description` per avvio lavoro
  - Aggiungere `dialogs.forceStatusTitle/Description` per force status
- [ ] Aggiornare le chiavi dei messaggi:
  - `messages.completedTitle/Description` → aggiornare terminologia "Work Closed"
  - Aggiungere `messages.startedTitle/Description` per avvio lavoro
  - Aggiungere `messages.forceStatusTitle/Description` per force status
- [ ] Aggiungere messaggio errore per transizione non valida (409)

---

## 11. Work Report Entry - Campo date nell'API

**File:** `src/lib/api.ts`

- [ ] Aggiungere parametro `date?: string` a `workReportsApi.createEntry()`
- [ ] Aggiungere parametro `date?: string` a `workReportsApi.updateEntry()`
- [ ] Nota: l'UI gia' supporta il campo date, manca solo il passaggio all'API

---

## 12. Aggiornamento PlantDetailPage e ClientDetailPage

**File:** `src/pages/PlantDetailPage.tsx`, `src/pages/ClientDetailPage.tsx`

- [ ] Rimuovere chiamate a `getWorkStatus()` e usare `work.status` direttamente
- [ ] Aggiornare display dello stato dei lavori collegati

---

## 13. Campi opzionali nella creazione lavoro

**File:** `src/pages/CreateWorkPage.tsx`, `src/types/index.ts`

- [ ] Verificare che i seguenti campi siano opzionali nel form di creazione:
  - `atixClientId`
  - `nasSubDirectory`
  - `electricalSchemaProgression`
  - `programmingProgression`
- [ ] Rimuovere eventuale validazione obbligatoria nel frontend per questi campi
- [ ] Solo `name`, `orderNumber`, `bidNumber`, `orderDate` devono essere obbligatori

---

## Riepilogo Priorita'

| Priorita' | Task | Impatto |
|-----------|------|---------|
| ALTA | #1 Tipo WorkStatus + Work | Blocca tutto il resto |
| ALTA | #2 Rimuovere getWorkStatus() | Usato ovunque |
| ALTA | #5-6 Filtri WorksPage | Pagina principale rotta |
| ALTA | #7 Transizioni WorkDetailPage | Funzionalita' core |
| MEDIA | #3 Endpoint start | Nuova transizione necessaria |
| MEDIA | #9 Dashboard | Dati errati senza fix |
| MEDIA | #10 i18n | Testi incoerenti |
| MEDIA | #11 Report date API | Fix minore |
| BASSA | #4 Force status | Feature solo OWNER |
| BASSA | #8 Errore 409 | UX improvement |
| BASSA | #12 Plant/Client pages | Impatto limitato |
| BASSA | #13 Campi opzionali | Probabilmente gia' funzionante |
