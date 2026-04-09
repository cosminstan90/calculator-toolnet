# Faza 3 - Backend, Payload si DB

## Scope inchis

- indexuri adaugate pentru campurile publice si operationale cu volum mare
- endpoint-uri de health si suggest mai ieftine
- deduplicare per-request pentru lookup-urile publice frecvente
- cache cross-request pentru listari publice si sitemap-uri
- cache pentru related content pe paginile calculator si articol

## Ce s-a optimizat

### Indexuri

- `publishingSchedule.earliestAt`
- `calculators.category`
- `calculators.publishedAt`
- `calculators.isFeatured`
- `articles.relatedCategory`
- `articles.author`
- `articles.publishedAt`
- `redirects.statusCode`
- `redirects.isEnabled`
- `notFoundEvents.hits`
- `notFoundEvents.firstSeenAt`
- `notFoundEvents.lastSeenAt`
- `notFoundEvents.source`
- `notFoundEvents.resolvedByRedirect`
- `affiliateClickEvents.sourceType`
- `affiliateClickEvents.audience`
- `affiliateClickEvents.categorySlug`

### Read path public

- homepage content
- navigation categories
- all categories index
- featured calculators
- recent articles
- calculators by audience
- articles by audience
- calculators by category
- articles by category
- calculator by slug
- category by slug
- article by slug
- public author by slug
- articles by author

### Related content

- related calculators
- suggested articles for calculator
- suggested calculators for article
- suggested articles for article

### Sitemap

- all authors
- all categories
- all calculators
- all articles

## Efect asteptat

- mai putine query-uri repetitive pe request
- mai putine query-uri identice intre request-uri
- TTFB mai stabil pe homepage, hub-uri si pagini de categorie
- cost mai mic pentru sitemap-uri si pagini de autor
- pagini calculator/articol mai eficiente la legaturile conexe

## Validare

- `npm.cmd run lint`
- `npm.cmd run build`

## Deploy VPS

Pentru ca faza include si indexuri noi in schema:

```bash
cd /home/toolnet/htdocs/toolnet.ro
git pull origin main
npm ci --include=dev
npm run build
npm run ops:init-db
pm2 restart calculatoare-online --update-env
pm2 save
```
