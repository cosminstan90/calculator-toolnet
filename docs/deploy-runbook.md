# Deploy Runbook

## Deploy standard

```bash
cd /home/toolnet/htdocs/toolnet.ro
git pull origin main
npm ci --include=dev
npm run build
pm2 restart calculatoare-online --update-env
pm2 save
```

## Cand rulezi si schema / DB

Ruleaza si `ops:init-db` cand schimbarea atinge:

- colectii Payload
- field-uri noi
- indexuri noi
- enum-uri noi

```bash
cd /home/toolnet/htdocs/toolnet.ro
git pull origin main
npm ci --include=dev
npm run build
npm run ops:init-db
pm2 restart calculatoare-online --update-env
pm2 save
```

## Cand rulezi si bootstrap

Ruleaza si `ops:bootstrap-cms -- --force` cand schimbarea atinge:

- seed-uri noi
- categorii noi
- calculatoare noi
- articole noi
- redirect-uri seed
- launch plan seed / batch updates

```bash
cd /home/toolnet/htdocs/toolnet.ro
git pull origin main
npm ci --include=dev
npm run build
npm run ops:init-db
npm run ops:bootstrap-cms -- --force
pm2 restart calculatoare-online --update-env
pm2 save
```

## Smoke checks dupa deploy

```bash
curl -I https://toolnet.ro/
curl -I https://toolnet.ro/calculatoare
curl -I https://toolnet.ro/blog
curl -I https://toolnet.ro/admin
curl -I https://toolnet.ro/api/graphql
curl -H "x-health-token: $CONTENT_HEALTH_TOKEN" https://toolnet.ro/api/health/content
curl -H "x-health-token: $OPS_HEALTH_TOKEN" https://toolnet.ro/api/health/ops
```

Ce vrei sa vezi suplimentar:

- `/api/graphql` ramane functional pentru Payload, dar playground-ul nu mai apare in productie
- `/api/internal/*` nu este accesibil public din Nginx
- raspunsurile includ headere ca `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`

## Verificari rapide in UI

- homepage se incarca
- `/calculatoare` se incarca
- un category hub important se incarca
- un calculator important se incarca
- un articol important se incarca
- admin login merge

## Daca publish queue este implicata

```bash
cd /home/toolnet/htdocs/toolnet.ro
npm run ops:launch-plan-readiness
npm run ops:launch-plan-focus -- --limit=15
npm run ops:ops-report
```

## Validare post-deploy

```bash
cd /home/toolnet/htdocs/toolnet.ro
npm run ops:smoke-check
npm run ops:perf-snapshot
```

Ce vrei sa vezi:

- `smoke-check.ok = true`
- status `200` pe paginile publice cheie
- status valid pe `/admin`
- health endpoints functionale
- timpi rezonabili pe paginile etalon din `perf-snapshot`

## Debug rapid

```bash
pm2 logs calculatoare-online --lines 100
pm2 status
curl -I http://127.0.0.1:3015/
curl -I http://127.0.0.1:3015/admin
```

## Hardening VPS

1. aplica snippet-ul din [nginx-security.conf](/D:/Projects/Tools/calculatoare-online/docs/nginx-security.conf)
2. verifica sa existe tokenuri reale pentru:
   - `CONTENT_HEALTH_TOKEN`
   - `OPS_HEALTH_TOKEN`
   - `BOOTSTRAP_TOKEN`
   - `CONTENT_IMPORT_TOKEN`
   - `SEO_AUDIT_TOKEN`
3. confirma:

```bash
curl -I https://toolnet.ro/api/graphql
curl -I https://toolnet.ro/api/internal/bootstrap/cms
curl -I https://toolnet.ro/
```
