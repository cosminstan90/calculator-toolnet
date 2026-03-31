# Deploy pe VPS

Stack-ul ramane clasic, fara Docker:

- Next.js + Payload ruleaza prin `pm2`
- PostgreSQL poate rula local pe VPS sau separat
- Nginx sau CloudPanel fac reverse proxy spre aplicatie

## Pasii recomandati

1. Configureaza DNS-ul catre IP-ul VPS-ului.
2. Instaleaza Node.js 22, npm, PM2, Nginx si PostgreSQL.
3. Cloneaza proiectul in `/srv/calculatoare-online`.
4. Copiaza `.env.example` in `.env` si seteaza:
   - `PORT=3015`
   - `NEXT_PUBLIC_SERVER_URL=https://calculatoare.domeniul-tau.ro`
   - `DATABASE_URI=postgresql://user:parola@127.0.0.1:5432/calculatoare_online`
   - `PAYLOAD_SECRET`
   - `BOOTSTRAP_TOKEN`
   - `CONTENT_HEALTH_TOKEN`
   - `SEO_AUDIT_TOKEN`
   - `CONTENT_IMPORT_TOKEN`
   - optional `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - optional `GOOGLE_SITE_VERIFICATION`
   - optional `BING_SITE_VERIFICATION`
5. Instaleaza dependintele si construieste aplicatia:

```bash
npm ci
npm run build
```

6. Porneste aplicatia:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

7. Ruleaza bootstrap-ul initial pentru homepage, categorii, formule si calculatoare:

```bash
npm run ops:bootstrap-cms
```

8. Pune Nginx in fata aplicatiei si activeaza HTTPS.

## Reverse proxy

```nginx
location / {
  proxy_pass http://127.0.0.1:3015;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

## Health si operare

```bash
npm run ops:validate-content
npm run ops:seo-audit
npm run ops:import-content -- --input=imports/content.json
```

## Search Console si Bing

1. Adauga domeniul in Google Search Console si Bing Webmaster Tools.
2. Seteaza `GOOGLE_SITE_VERIFICATION` si `BING_SITE_VERIFICATION` in `.env`.
3. Rebuild + restart PM2.
4. Trimite sitemap-ul principal:
   - `https://domeniu.ro/sitemap_index.xml`

Cron recomandat pentru health check la 6 ore:

```bash
0 */6 * * * cd /srv/calculatoare-online && /usr/bin/npm run ops:validate-content >> /var/log/calculatoare-content-health.log 2>&1
```

## Observatii

- bootstrap-ul nu suprascrie continutul existent decat daca rulezi cu `--force`
- PM2 si reverse proxy-ul raman identice cu proiectul de baza, doar numele aplicatiei si variabilele de mediu se schimba
- daca vrei media locala in Payload, poti adauga ulterior o colectie `media` fara sa schimbi arhitectura de baza
