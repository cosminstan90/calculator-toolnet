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
npm run ops:queue-worklist -- --limit=15
npm run ops:queue-today
npm run ops:sprint-a
```

### 6. Marchezi documentele terminate dupa review

Calculatoare:

```bash
npm run ops:queue-complete -- --collection=calculators --slugs=calculator-cost-total-credit,calculator-rata-maxima-suportabila
```

Articole:

```bash
npm run ops:queue-complete -- --collection=articles --slugs=cum-citesti-costul-total-al-unui-credit
```

Dry run:

```bash
npm run ops:queue-complete -- --collection=calculators --slugs=calculator-cost-total-credit --dry-run
```

### 7. Rulezi roadmap-ul SEO/editorial

```bash
npm run ops:sprint-b
npm run ops:seo-roadmap
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
npm run ops:queue-worklist -- --limit=15
npm run ops:queue-today
curl -H "x-health-token: $OPS_HEALTH_TOKEN" https://toolnet.ro/api/health/ops
```

## Sprint A

Fluxul rapid pentru sprintul editorial curent:

```bash
npm run ops:sprint-a
```

Ce primesti:

- `publishingQueue`: starea generala `ready` vs `blocked`
- `queueWorklist.readyNow`: ce poate fi impins imediat
- `queueWorklist.blockedButClose`: documente aproape gata
- `queueWorklist.needsEditorialReview`: articolele ce asteapta review
- `today`: checklistul foarte scurt pentru dimineata si seara

Rutina zilnica recomandata:

1. rulezi `npm run ops:sprint-a`
2. validezi documentele din `readyNow`
3. rulezi `queue-complete` pentru cele revizuite
4. iei `blockedButClose` ca urmator lot

## Sprint B

Fluxul rapid pentru roadmap-ul SEO/editorial:

```bash
npm run ops:sprint-b
```

Ce primesti:

- `clusters`: starea celor 3 clustere principale
- `roadmap`: urmatoarele 30 de pagini sau optimizari prioritare
- `nextSevenDays`: ce merita impins imediat
- `globalContentGaps`: gap-uri reale din 404
- `internalLinkingPriorities`: regulile clare de interlinking
