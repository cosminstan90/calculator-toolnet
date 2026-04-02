# Calculatoare Online

Platforma SSR/ISR pentru calculatoare online si continut explicativ SEO-first, construita pe:

- Next.js App Router
- Payload CMS v3
- PostgreSQL
- Tailwind CSS v4
- deploy clasic pe VPS + PM2, fara Docker

## Focusul proiectului

- hub-uri de categorie pentru intentii de cautare: fitness, auto, energie, conversii
- pagini de calculator cu tool functional, explicatii, exemple si FAQ
- articole evergreen care completeaza tool-urile si cresc topical authority
- metadata, canonical, JSON-LD, sitemaps si internal linking curate
- workflow editorial cu draft + review uman in Payload

## Structura URL

- `/`
- `/calculatoare`
- `/calculatoare/{categorySlug}`
- `/calculatoare/{categorySlug}/{calculatorSlug}`
- `/blog`
- `/blog/{slug}`
- `/despre-noi`
- `/metodologie`
- `/politica-editoriala`

## Colectii CMS

- `users`
- `calculator-categories`
- `calculators`
- `articles`
- `formula-library`
- global `homepage`

## API-uri

- `GET /api/search/suggest?q=`
- `GET /api/health/content`
- `POST /api/internal/bootstrap/cms`
- `POST /api/internal/import/content`

## Analytics si webmaster tools

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` activeaza GA4 prin [ga4.tsx](/D:/Projects/Tools/calculatoare-online/src/components/ga4.tsx)
- `GOOGLE_SITE_VERIFICATION` injecteaza meta tag-ul pentru Google Search Console
- `BING_SITE_VERIFICATION` injecteaza meta tag-ul `msvalidate.01` pentru Bing Webmaster Tools
- `robots.txt` si `sitemap_index.xml` sunt deja pregatite pentru Search Console si Bing
- sitemap-uri dedicate pentru:
  - `pages.xml`
  - `authors.xml`
  - `categories.xml`
  - `calculators.xml`
  - `articles.xml`
- `llms.txt` este disponibil ca ghid lightweight pentru sisteme AI / retrieval

## AdSense si toggle reclame

- `NEXT_PUBLIC_ADS_ENABLED=true|false` controleaza starea initiala a reclamelor
- `NEXT_PUBLIC_SHOW_ADS_TOGGLE=true|false` afiseaza butonul vizibil `Ads: ON/OFF`
- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx`
- sloturi recomandate:
  - `NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE`
  - `NEXT_PUBLIC_ADSENSE_SLOT_CALCULATORS_HUB_INLINE`
  - `NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_INLINE`
  - `NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR_INLINE`
  - `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE`

Cand toggle-ul este pe `OFF`, scriptul AdSense nu se mai injecteaza si sloturile nu se randaza.

## Comenzi utile

```bash
npm install
npm run dev
npm run build
npm run lint
npm run payload
npm run payload:types
npm run payload:importmap
npm run ops:init-db
npm run ops:bootstrap-cms
npm run ops:validate-content
npm run ops:seo-audit
npm run ops:import-content -- --input=imports/content.json
```

## Redirect-uri si 404

- redirect-urile sunt gestionate din colectia `redirects`
- URL-urile necunoscute trec printr-un catch-all care verifica redirect-ul in CMS
- daca nu exista mapare, hit-ul este logat in `not-found-events`

## Import continut

- scriptul `ops:import-content` accepta fisiere JSON sau CSV
- entitati suportate: `calculator`, `article`, `redirect`
- pentru CSV foloseste o coloana `type`

## Seed initial

Bootstrap-ul CMS creeaza:

- homepage-ul nou
- 4 categorii de calculatoare
- 20 calculatoare functionale
- articole suport
- intrari de baza in `formula-library`

## Prima initializare DB pe Linux / VPS

Daca `payload migrate` se loveste de incompatibilitati ESM/TypeScript in CLI, foloseste:

```bash
npm run ops:init-db
```

Scriptul initializeaza Payload in mod controlat si lasa adapterul Postgres sa creeze schema de baza inainte de primul acces la `/admin`.

## Deploy

Deploy-ul VPS/PM2 ramane simplu, fara Docker.

- ghid operational general: [docs/deploy-vps.md](/D:/Projects/Tools/calculatoare-online/docs/deploy-vps.md)
- ghid dedicat pentru CloudPanel: [docs/migrare-cloudpanel.md](/D:/Projects/Tools/calculatoare-online/docs/migrare-cloudpanel.md)
