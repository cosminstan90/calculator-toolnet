# Faza 1 - Audit de performanta si quick wins

Data auditului: `2026-04-09`  
Scop: sa inchidem Faza 1 cu o lista executabila de pagini etalon, riscuri reale din cod, quick wins prioritizate si check-uri de verificare.

## Status Faza 1

- `Done`: selectie pagini etalon pentru audit
- `Done`: inventar al fetch-urilor publice si al scripturilor terte
- `Done`: identificare hotspot-uri pentru TTFB, JS si caching
- `Done`: backlog cu top 10 quick wins
- `Done`: reducere a adancimii query-urilor publice din content layer
- `Done`: caching dedicat pentru navigatia globala
- `Done`: montare conditionata pentru scripturi globale de ads si analytics
- `Done`: incarcare lazy pentru runner-ul de calculator
- `Done`: check-uri recomandate pentru validare dupa schimbari
- `Pending`: masuratori live Lighthouse/Web Vitals pe productie sau preview controlat

## Pagini Etalon Pentru Audit

Aceste URL-uri sunt baza pentru toate verificarile de performanta din sprinturile urmatoare.

### Pagini principale

- `/`
- `/calculatoare`
- `/blog`

### Category hubs

- `/calculatoare/credite-si-economii`
- `/calculatoare/energie-pentru-casa`
- `/calculatoare/imobiliare`

### Calculator pages

- `/calculatoare/credite-si-economii/calculator-cost-total-credit`
- `/calculatoare/energie-pentru-casa/calculator-factura-curent`
- `/calculatoare/energie-pentru-casa/calculator-amortizare-panouri-fotovoltaice`
- `/calculatoare/imobiliare/calculator-cost-total-achizitie-locuinta`
- `/calculatoare/imobiliare/calculator-chirie-vs-cumparare`

### Article pages

- `/blog/cum-citesti-costul-total-al-unui-credit`
- `/blog/cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile`
- `/blog/ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte`

## Ce Am Verificat In Cod

### Rute publice

- homepage: [page.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\page.tsx)
- index calculatoare: [page.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\calculatoare\page.tsx)
- category page: [page.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\calculatoare\[categorySlug]\page.tsx)
- calculator page: [page.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\calculatoare\[categorySlug]\[calculatorSlug]\page.tsx)
- blog index: [page.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\blog\page.tsx)
- article page: [page.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\blog\[slug]\page.tsx)
- site layout: [layout.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\layout.tsx)

### Content layer si data fetching

- public content layer: [content.ts](D:\Projects\Tools\calculatoare-online\src\lib\content.ts)
- payload cache init: [payload.ts](D:\Projects\Tools\calculatoare-online\src\lib\payload.ts)
- registry formule calculatoare: [calculator-registry.ts](D:\Projects\Tools\calculatoare-online\src\lib\calculator-registry.ts)

### Scripturi si routes care influenteaza performanta

- config Next: [next.config.ts](D:\Projects\Tools\calculatoare-online\next.config.ts)
- sitemap index: [route.ts](D:\Projects\Tools\calculatoare-online\src\app\sitemap_index.xml\route.ts)
- sitemap calculatoare: [route.ts](D:\Projects\Tools\calculatoare-online\src\app\sitemaps\calculators.xml\route.ts)
- sitemap articole: [route.ts](D:\Projects\Tools\calculatoare-online\src\app\sitemaps\articles.xml\route.ts)

### Componente cu impact runtime

- runner calculator: [calculator-runner.tsx](D:\Projects\Tools\calculatoare-online\src\components\calculator-runner.tsx)
- header global: [site-header.tsx](D:\Projects\Tools\calculatoare-online\src\components\site-header.tsx)
- script GA4: [ga4.tsx](D:\Projects\Tools\calculatoare-online\src\components\ga4.tsx)
- script AdSense: [google-adsense.tsx](D:\Projects\Tools\calculatoare-online\src\components\google-adsense.tsx)
- ad slots: [ad-slot.tsx](D:\Projects\Tools\calculatoare-online\src\components\ad-slot.tsx)
- toggle ads: [ads-toggle.tsx](D:\Projects\Tools\calculatoare-online\src\components\ads-toggle.tsx)

## Baseline Tehnic Extras Din Cod

### Caching si revalidate

- majoritatea paginilor publice folosesc `revalidate = 900`
- sitemap-urile folosesc tot `revalidate = 900`
- Payload este cache-uit la nivel de instanta in [payload.ts](D:\Projects\Tools\calculatoare-online\src\lib\payload.ts)

### Query-uri publice cu risc de cost mare

- in [content.ts](D:\Projects\Tools\calculatoare-online\src\lib\content.ts), multe listari folosesc `depth: 2` chiar si pentru pagini index
- `/calculatoare` incarca pana la `100` calculatoare si filtreaza dupa aceea
- category pages incarca pana la `100` calculatoare per categorie plus articole asociate
- homepage incarca simultan continut editorial, categorii, calculatoare featured si articole recente
- paginile de calculator si articol incarca mereu si continut conex
- sitemap-ul de calculatoare foloseste `limit: 10000` cu date extrase din content layer

### JS si runtime

- `CalculatorRunner` este componenta client si depinde de [calculator-registry.ts](D:\Projects\Tools\calculatoare-online\src\lib\calculator-registry.ts)
- registry-ul are aproximativ `213 KB` si peste `6300` linii
- scripturile GA4, AdSense si `AdsToggle` sunt injectate global prin layout
- `AdSlot` ruleaza logica client-side cu `localStorage`, listeners si `adsbygoogle.push()` pe paginile unde apare

### Layout global

- [layout.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\layout.tsx) face fetch la `listCategories(10)` pentru orice pagina publica
- asta inseamna cost Payload pe fiecare render server-side pentru navigatie, inclusiv pe pagini unde utilizatorul nu interactioneaza cu meniul de categorii

### Imagini si fonturi

- nu exista un cost major evident din imagini pe paginile inspectate
- nu exista integrare vizibila `next/font` in fisierele inspectate
- problema dominanta nu pare media, ci data fetching plus scripturi terte plus JS client

## Hotspot-uri Confirmate

### 1. Content layer prea greu pentru listari

Semnal:

- `depth: 2` este folosit in prea multe locuri
- unele pagini cer mult mai multe documente decat afiseaza efectiv

Impact estimat:

- TTFB mai mare
- presiune inutila pe Payload/Postgres
- cost suplimentar pe paginile index si pe sitemap

### 2. Navigatia globala costa un fetch pe orice pagina

Semnal:

- layout-ul site-ului incarca categorii din Payload la fiecare request/revalidate

Impact estimat:

- TTFB mai slab pe toate paginile publice
- cost constant pe orice trafic nou

### 3. Third-party scripts prea aproape de nucleul public

Semnal:

- GA4, AdSense si toggle-ul de ads sunt montate global

Impact estimat:

- risc pe LCP si INP
- crestere a costului de hydration si executie pe mobile

### 4. Calculator registry probabil prea mare pentru client

Semnal:

- [calculator-registry.ts](D:\Projects\Tools\calculatoare-online\src\lib\calculator-registry.ts) este mare
- `CalculatorRunner` obtine definitia din registry pe client

Impact estimat:

- bundle mai mare pe paginile de calculator
- cost mai mare la parse si execute

### 5. Sitemap-urile folosesc acelasi content layer greu

Semnal:

- sitemap calculators si articles trec prin functii din [content.ts](D:\Projects\Tools\calculatoare-online\src\lib\content.ts)

Impact estimat:

- cost operational inutil pentru rute care au nevoie doar de `slug` si date de actualizare

## Inventar Scripturi Terte

### Montate global prin layout

- Google Analytics 4
- Google AdSense
- Ads toggle

### Montate conditionat in pagini

- ad slots in homepage, categories, calculators, articles

### Concluzie

- pentru Faza 1, scripturile terte trebuie tratate ca factor major in audit
- urmatorul pas logic este sa masuram separat:
  - cu ads pornite
  - cu ads oprite

## Quick Wins Prioritizate

### Top 10 task-uri

1. `QW-01` Redu `depth` din public content layer pentru listari si sitemap-uri.
2. `QW-02` Creeaza loadere dedicate pentru header navigation, cu payload minim si cache mai agresiv.
3. `QW-03` Opreste incarcarea a `100` de calculatoare pe `/calculatoare`; foloseste paginare sau subset initial.
4. `QW-04` Opreste folosirea content layer-ului greu pentru sitemap si citeste doar campurile strict necesare.
5. `QW-05` Evalueaza separarea formulelor de metadata ca sa nu trimiti tot registry-ul in client.
6. `QW-06` Izoleaza AdSense si ad slots astfel incat sa nu afecteze paginile fara intentie comerciala mare.
7. `QW-07` Masoara efectul GA4 si AdSense pe mobile, nu doar desktop.
8. `QW-08` Introdu cache/revalidate diferentiat pentru homepage, hubs si pagini editoriale.
9. `QW-09` Curata fetch-urile de continut conex cand nu exista suficienta valoare pentru paginile cu trafic mic.
10. `QW-10` Adauga un mod de audit pentru bundle size sau analyzer de build.

## Checklist Executabil

### Audit si masurare

- `Done` Selecteaza URL-urile etalon
- `Done` Identifica componentele publice critice
- `Done` Identifica fetch-urile publice critice
- `Pending` Ruleaza Lighthouse pe cele 12 URL-uri etalon
- `Pending` Noteaza LCP, CLS, INP, TTFB pentru fiecare
- `Pending` Ruleaza comparatie mobile vs desktop
- `Pending` Ruleaza comparatie ads on vs ads off

### Quick wins de implementare

- `Todo` Rescrie loaderele de listare cu payload minim
- `Todo` Introdu loadere separate pentru sitemap
- `Todo` Reduce datele trimise in header
- `Todo` Revizuieste `CalculatorRunner` si impartirea registry-ului
- `Todo` Muta sau conditioneaza mai strict scripturile terte
- `Todo` Stabileste cache policies per tip de pagina

### Verificare dupa implementare

- `Todo` Reruleaza Lighthouse pe aceleasi URL-uri
- `Todo` Compara metricile cu baseline-ul
- `Todo` Verifica lipsa regresiilor functionale
- `Todo` Verifica build-ul si bundle output
- `Todo` Verifica ca scheduler, admin si routes publice raman ok

## Check-uri Recomandate Dupa Orice Serie De Optimizari

Ruleaza local:

```bash
npm run lint
npm run build
```

Ruleaza pe preview sau productie controlata:

```bash
curl -I https://toolnet.ro/
curl -I https://toolnet.ro/calculatoare
curl -I https://toolnet.ro/calculatoare/credite-si-economii
curl -I https://toolnet.ro/calculatoare/energie-pentru-casa/calculator-factura-curent
curl -I https://toolnet.ro/blog/cum-citesti-costul-total-al-unui-credit
```

Ruleaza si masoara:

- Lighthouse mobile pentru homepage
- Lighthouse mobile pentru un category hub
- Lighthouse mobile pentru un calculator high-intent
- Lighthouse mobile pentru un articol high-intent

## Ce Consideram Incheiat Pentru Faza 1

Faza 1 este considerata inchisa cand avem:

- URL-uri etalon fixe
- hotspot-uri confirmate in cod
- quick wins ordonate dupa impact
- check-uri standard de verificare
- baseline live salvat pentru comparatie

## Recomandare Pentru Faza Urmatoare

Cea mai buna ordine pentru implementare este:

1. optimizari in [content.ts](D:\Projects\Tools\calculatoare-online\src\lib\content.ts)
2. optimizari in [layout.tsx](D:\Projects\Tools\calculatoare-online\src\app\(site)\layout.tsx)
3. audit pe `CalculatorRunner` si registry
4. reducerea impactului scripturilor terte
5. rerulare de metrici si comparatie
