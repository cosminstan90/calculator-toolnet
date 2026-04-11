# Sprint B

Obiectivul Sprintului B este sa transformam queue-ul si categoriile deja pregatite intr-un sistem editorial orientat pe:

- topical authority
- internal linking coerent
- answer-first content
- pagini cu intentie comerciala mare

Sprintul B nu deschide verticale noi. El intareste trei clustere:

1. `credite-si-economii`
2. `energie-pentru-casa`
3. `imobiliare`

## Ce urmarim

- fiecare cluster are un hub clar
- fiecare cluster are 4-6 pagini principale care pot castiga trafic si incredere
- fiecare articol important trimite catre calculatoarele potrivite
- fiecare calculator important are articol suport si hub relevant
- vedem separat:
  - ce este deja publicat
  - ce este gata de publicare
  - ce exista dar e blocat
  - ce lipseste complet

## Comenzi

Raportul principal al sprintului:

```bash
npm run ops:sprint-b
```

Alias SEO roadmap:

```bash
npm run ops:seo-roadmap
```

Cu limita personalizata:

```bash
npm run ops:sprint-b -- --limit=30
```

## Ce primesti din raport

- `clusters`
  - summary per cluster
  - coverage pe calculatoare si articole
  - pagini `ready now`
  - pagini `blocked but close`
  - lipsuri reale in nucleul clusterului
- `roadmap`
  - lista prioritara de pagini pentru urmatoarele 30 mutari
- `nextSevenDays`
  - ce merita impins imediat
- `globalContentGaps`
  - gap-uri reale din 404
- `internalLinkingPriorities`
  - hub-uri si reguli de legare intre pagini

## Regula de prioritizare

Ordinea buna:

1. pagini `tier-1` deja existente si aproape gata
2. pagini `tier-1` existente dar blocate editorial
3. pagini `tier-1` complet lipsa
4. pagini `tier-2`
5. pagini `tier-3`

Nu extindem clusterul cu pagini secundare pana cand nucleul nu este:

- publicat
- interlink-uit
- raspunde clar la intrebarile principale

## KPI pentru Sprint B

La finalul sprintului vrem:

- hub-urile mari sa fie intarite editorial
- minim `2-3` articole `tier-1` in plus per cluster
- minim `3-4` calculatoare `tier-1` in plus per cluster
- interlinking clar intre hub, articol si calculator
- cel putin un content gap real recuperat din 404-uri

## Content gap imediat

Primul gap real din productie care merita tratat separat:

- `zile-libere-2026`

Nu apartine unuia dintre cele trei clustere principale, dar este o oportunitate buna de trafic sezonier si merita pus in backlog-ul separat de quick wins.
