# Migrare pe VPS cu CloudPanel

Ghidul de mai jos este pentru `Calculatoare Online`, proiectul nostru Next.js + Payload CMS + PostgreSQL, rulat fara Docker si mentinut prin `PM2`.

## Ce pastram

- CloudPanel pentru provisioning, Nginx, SSL, utilizatori si UI de administrare
- `PM2` pentru procesul Next.js / Payload
- PostgreSQL separat de CloudPanel
- deploy clasic prin `git pull` + `npm ci` + `npm run build` + restart `pm2`

## Observatie importanta despre PostgreSQL

Din documentatia oficiala CloudPanel rezulta ca instalatorul v2 vine cu optiuni pentru `MySQL` si `MariaDB`, nu pentru `PostgreSQL`. Pentru proiectul nostru, asta inseamna ca PostgreSQL trebuie gestionat separat:

- fie pe acelasi VPS, instalat manual prin pachetele sistemului de operare
- fie pe un server separat / managed database

Aceasta este o inferenta practica din sursele oficiale CloudPanel, nu o afirmatie explicita de tip "PostgreSQL nu este suportat deloc". CloudPanel nu este panoul prin care vom administra baza noastra Postgres.

## Arhitectura recomandata

```text
Internet
  -> CloudPanel / Nginx
  -> Node.js site pe domeniu
  -> reverse proxy spre 127.0.0.1:3015
  -> PM2 ruleaza `npm start`
  -> aplicatia Next.js + Payload
  -> PostgreSQL local sau remote
```

## Variante bune de hosting

Conform documentatiei oficiale CloudPanel, baza buna pentru instalare este:

- Ubuntu 24.04 LTS
- Ubuntu 22.04 LTS
- Debian 12
- Debian 11

Pentru proiectul nostru as merge pe:

1. Ubuntu 24.04 LTS
2. 2 vCPU
3. 4 GB RAM minim
4. 60+ GB SSD

Pentru productie mai serioasa cu crawl constant, build-uri si admin Payload activ, 8 GB RAM este mai confortabil.

## 1. Pregatirea VPS-ului

1. Creezi VPS-ul si pointezi DNS-ul domeniului catre IP.
2. Restrictionezi accesul la portul `8443` doar pentru IP-ul tau pana creezi userul de admin CloudPanel.
3. Instalezi CloudPanel v2 pe sistemul de operare suportat.
4. Creezi userul de admin in CloudPanel imediat dupa instalare.

## 2. Adaugarea site-ului in CloudPanel

CloudPanel v2 suporta site-uri `Node.js`, iar comanda oficiala CLI pentru creare este de forma:

```bash
clpctl site:add:nodejs \
  --domainName=calculatoareonline.ro \
  --nodejsVersion=22 \
  --appPort=3015 \
  --siteUser=toolnet \
  --siteUserPassword='o-parola-lunga'
```

Poti face acelasi lucru si din UI:

1. `Sites`
2. `Add Site`
3. alegi `Node.js`
4. setezi domeniul
5. setezi `Node.js 22`
6. setezi `App Port = 3015`

Pentru proiectul nostru:

- domeniu principal: `calculatoareonline.ro`
- `www` redirectionat spre versiunea canonica dorita
- port aplicatie: `3015`
- user dedicat de site, separat de altele

## 3. Structura de directoare recomandata

CloudPanel creeaza un user de site. Cloneaza proiectul sub acel user, in directorul site-ului. In practica, foloseste structura generata de CloudPanel pentru site-ul Node.js si pastreaza repository-ul acolo.

Recomandarea mea:

- codul aplicatiei sa fie in directorul principal al site-ului creat de CloudPanel
- fisierele de build sa ramana locale
- `storage` sau exporturile manuale sa ramana in afara repo-ului daca apar ulterior

## 4. Node.js si dependinte

CloudPanel v2 expune versiuni de Node.js gestionate prin NVM, iar Node 22 este disponibil in documentatia oficiala actuala. Pentru proiectul nostru ramane versiunea recomandata.

Dupa conectarea cu userul site-ului:

```bash
node -v
npm -v
```

Apoi:

```bash
npm ci
npm run build
```

Daca prima initializare a bazei se loveste de blocaje in `payload migrate`, ruleaza:

```bash
npm run ops:init-db
```

Asta forteaza initializarea controlata a schemei Postgres inainte de primul acces la `/admin`.

## 5. Variabile de mediu

Creezi `.env` pe server pornind din `.env.example`.

Minimul necesar:

```env
NODE_ENV=production
PORT=3015
NEXT_PUBLIC_SERVER_URL=https://calculatoareonline.ro
DATABASE_URI=postgresql://USER:PAROLA@127.0.0.1:5432/calculatoare_online
PAYLOAD_SECRET=schimba-cu-o-valoare-lunga-si-random
BOOTSTRAP_TOKEN=schimba-tokenul
CONTENT_HEALTH_TOKEN=schimba-tokenul
SEO_AUDIT_TOKEN=schimba-tokenul
CONTENT_IMPORT_TOKEN=schimba-tokenul
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=...
BING_SITE_VERIFICATION=...
```

Pentru un Postgres remote:

```env
DATABASE_URI=postgresql://USER:PAROLA@host-extern:5432/calculatoare_online?sslmode=require
```

## 6. PostgreSQL pentru acest proiect

### Varianta A: PostgreSQL local pe VPS

Instalezi manual PostgreSQL din pachetele sistemului:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Apoi:

```bash
sudo -u postgres psql
CREATE USER calculatoare_user WITH PASSWORD 'parola-foarte-lunga';
CREATE DATABASE calculatoare_online OWNER calculatoare_user;
\q
```

Testezi:

```bash
psql "postgresql://calculatoare_user:parola-foarte-lunga@127.0.0.1:5432/calculatoare_online"
```

### Varianta B: PostgreSQL separat

Este varianta mai buna daca vrei backup separat, update-uri mai simple si izolare mai buna. Pentru Payload + Next.js functioneaza foarte bine si reduce complexitatea in CloudPanel.

## 7. Pornirea aplicatiei cu PM2

Proiectul are deja:

- [ecosystem.config.cjs](/D:/Projects/Tools/calculatoare-online/ecosystem.config.cjs)

Pornire:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Verificare:

```bash
pm2 status
pm2 logs calculatoare-online --lines 100
curl -I http://127.0.0.1:3015
```

## 8. Reverse proxy si SSL

Site-ul `Node.js` din CloudPanel foloseste Nginx ca reverse proxy catre portul aplicatiei. Pentru noi conteaza sa fie corect setate:

- domeniul
- certificatul SSL
- `appPort = 3015`

Dupa ce site-ul raspunde intern:

1. activezi certificatul Let's Encrypt din CloudPanel
2. verifici redirect-ul HTTP -> HTTPS
3. verifici `www` vs non-`www`
4. confirmi ca `NEXT_PUBLIC_SERVER_URL` foloseste varianta canonica

## 9. Primul deploy

Ordinea buna pentru primul deploy:

```bash
git clone REPO-UL-TAU
cd calculatoare-online
npm ci
npm run build
npm run ops:init-db
pm2 start ecosystem.config.cjs
```

Apoi:

```bash
curl http://127.0.0.1:3015/api/health/content
```

Daca baza si env-urile sunt bune:

```bash
npm run ops:bootstrap-cms
```

## 10. Fluxul de update fara downtime mare

Pentru update-uri simple:

```bash
git pull origin main
npm ci
npm run build
pm2 restart calculatoare-online
```

Pentru verificari rapide dupa deploy:

```bash
pm2 logs calculatoare-online --lines 100
curl -I https://calculatoareonline.ro
curl -I https://calculatoareonline.ro/sitemap_index.xml
```

## 11. Checklist de productie

### In CloudPanel

- site `Node.js` creat pe domeniul corect
- Node 22 selectat
- SSL activ
- site user separat
- acces SSH cu cheie

### In aplicatie

- `.env` complet
- `NEXT_PUBLIC_SERVER_URL` corect
- `PAYLOAD_SECRET` generat sigur
- build reusit
- PM2 pornit
- sitemap functional
- `robots.txt` functional

### In SEO / tracking

- GA4 activ prin `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Google Search Console verificat
- Bing Webmaster Tools verificat
- sitemap trimis in ambele console

## 12. Ce as evita

1. Sa rulezi aplicatia direct pe port public, fara CloudPanel / Nginx in fata.
2. Sa pui PostgreSQL sub administrarea "logica" a CloudPanel, pentru ca stack-ul nostru nu este bazat pe MySQL/MariaDB.
3. Sa faci primul bootstrap inainte sa confirmi userul de admin Payload si conexiunea DB.
4. Sa sari peste `pm2 logs` dupa primul deploy.

## 13. Comenzi utile pentru noi

```bash
npm run lint
npm run build
npm run ops:validate-content
npm run ops:seo-audit
npm run ops:import-content -- --input=imports/content.json
```

## Surse oficiale folosite

- CloudPanel v2 Introduction: [cloudpanel.io/docs/v2/introduction](https://www.cloudpanel.io/docs/v2/introduction/)
- CloudPanel Requirements: [cloudpanel.io/docs/v2/requirements](https://www.cloudpanel.io/docs/v2/requirements/)
- CloudPanel Root User Commands: [cloudpanel.io/docs/v2/cloudpanel-cli/root-user-commands](https://www.cloudpanel.io/docs/v2/cloudpanel-cli/root-user-commands/)
- CloudPanel Installer example pages cu DB engine-urile disponibile: [cloudpanel.io/docs/v2/getting-started/oracle-cloud/installation/installer](https://www.cloudpanel.io/docs/v2/getting-started/oracle-cloud/installation/installer/)
