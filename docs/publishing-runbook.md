# Publishing Runbook

## Obiectiv

Acest runbook acopera:

- pregatirea documentelor pentru queue
- validarea starii editoriale
- verificarea blocajelor
- publicarea automata pe sloturi

## Ordinea buna

### 1. Aplici programul

```bash
cd /home/toolnet/htdocs/toolnet.ro
npm run ops:apply-launch-plan
```

### 2. Verifici readiness-ul

```bash
npm run ops:launch-plan-readiness
```

### 3. Vezi focus-ul pe primele documente

```bash
npm run ops:launch-plan-focus -- --limit=15
```

### 4. Pregatesti checklist-ul repetitiv

```bash
npm run ops:launch-plan-prepare -- --limit=15
```

### 5. Verifici starea operationala

```bash
npm run ops:ops-report
```

## Ce trebuie sa fie adevarat ca un document sa poata iesi live

### Calculatoare

- `editorialStatus` in `approved` sau `scheduled`
- `editorialChecklist.publishReady = true`
- `editorialChecklist.schemaValidated = true`
- `editorialChecklist.finalReviewDone = true`
- `publishingSchedule.slot` setat corect

### Articole

Pe langa cele de mai sus:

- `aiDraft.reviewStatus` in `reviewed` sau `published`

## Scheduler

Schedulerul foloseste:

- `publishingSchedule.slot`
- `publishingSchedule.priority`
- `publishingSchedule.earliestAt`
- `editorialStatus`
- `publishReady`

Comanda:

```bash
npm run ops:publish-scheduled -- --slot=morning
npm run ops:publish-scheduled -- --slot=evening
```

Dry run:

```bash
npm run ops:publish-scheduled -- --slot=morning --dry-run
npm run ops:publish-scheduled -- --slot=evening --dry-run
```

## Blocaje tipice

- `publishReady:false`
- `schemaValidated:false`
- `finalReviewDone:false`
- `reviewStatus:draft`
- `slot:none`
- `earliestAt` in viitor

## Verificare operationala rapida

```bash
npm run ops:ops-report
curl -H "x-health-token: $OPS_HEALTH_TOKEN" https://toolnet.ro/api/health/ops
```
