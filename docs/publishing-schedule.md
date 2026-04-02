# Publishing Schedule

Publicam in 2 sloturi editoriale fixe, ora `08:00` si ora `17:00`, in timezone-ul `Europe/Bucharest` daca nu este setat altfel prin `PUBLISHING_TIMEZONE`.

## Regula editoriala

- `08:00`: publica `1 articol` + `1 calculator`
- `17:00`: publica `1 calculator`

Scheduler-ul publica doar documente care indeplinesc simultan conditiile:

- `_status = draft`
- `editorialStatus` este `approved` sau `scheduled`
- `editorialChecklist.publishReady = true`
- `publishingSchedule.slot` este `morning` sau `evening`
- `publishingSchedule.earliestAt` este gol sau in trecut
- pentru articole, `aiDraft.reviewStatus` este `reviewed` sau `published`

## Campuri CMS

Atat `articles`, cat si `calculators`, au grupul `publishingSchedule`:

- `slot`
- `priority`
- `earliestAt`
- `lastAutoAt`
- `lastAutoSlot`

Scheduler-ul ia primul document eligibil cu `priority` cea mai mica.

## Comenzi utile

Dry run dimineata:

```bash
npm run ops:publish-scheduled -- --slot=morning --dry-run
```

Dry run seara:

```bash
npm run ops:publish-scheduled -- --slot=evening --dry-run
```

Rulare reala:

```bash
npm run ops:publish-scheduled -- --slot=morning
npm run ops:publish-scheduled -- --slot=evening
```

## Cron recomandat pe VPS

Din proiectul live:

```bash
0 8 * * * cd /home/toolnet/htdocs/toolnet.ro && /usr/bin/npm run ops:publish-scheduled -- --slot=morning >> /var/log/toolnet-publish-morning.log 2>&1
0 17 * * * cd /home/toolnet/htdocs/toolnet.ro && /usr/bin/npm run ops:publish-scheduled -- --slot=evening >> /var/log/toolnet-publish-evening.log 2>&1
```

## Recomandare operationala

- lasam `Batch 01` publicat
- pregatim `Batch 02` si `Batch 03` in `draft`
- mutam documentele gata pe `approved` sau `scheduled`
- bifam `publishReady`
- setam slotul si prioritatea

Astfel, scheduler-ul publica incremental fara sa scoata live pagini neterminate.
