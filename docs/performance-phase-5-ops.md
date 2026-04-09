# Faza 5 - Observability si Ops

## Scope inchis

- endpoint intern de health operational
- raport CLI pentru ops
- runbook de deploy
- runbook de publishing

## Ce am adaugat

### Health operational

Ruta:

- `/api/health/ops`

Returneaza:

- counts pe colectii cheie
- stare queue pentru articole si calculatoare
- top 404
- click-uri affiliate recente
- documente publicate recent

### Raport CLI

Comanda:

```bash
npm run ops:ops-report
```

Returneaza:

- counts
- publishing queue summary
- top blocked / top ready
- top 404
- afiliere recenta
- publicari recente

### Runbook-uri

- `docs/deploy-runbook.md`
- `docs/publishing-runbook.md`

## Output operational minim

Cu pachetul actual putem raspunde repede la:

- cate documente sunt in queue
- cate sunt gata de publicare
- ce le blocheaza
- ce 404-uri apar cel mai des
- ce oferte affiliate primesc click-uri
- ce s-a publicat recent

## Validare

- `npm.cmd run lint`
- `npm.cmd run build`

## Deploy VPS

```bash
cd /home/toolnet/htdocs/toolnet.ro
git pull origin main
npm ci --include=dev
npm run build
npm run ops:init-db
pm2 restart calculatoare-online --update-env
pm2 save
```

## Comenzi utile dupa deploy

```bash
npm run ops:ops-report
npm run ops:launch-plan-readiness
npm run ops:launch-plan-focus -- --limit=15
curl -H "x-health-token: $OPS_HEALTH_TOKEN" https://toolnet.ro/api/health/ops
```
