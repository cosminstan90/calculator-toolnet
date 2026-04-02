# Content Batches

Strategia editoriala pentru `toolnet.ro` este bazata pe batch-uri complete, nu pe publicare masiva.

Un calculator intra live doar daca are:

- tool functional
- formula validata
- continut principal complet
- examples
- interpretation notes
- FAQ util
- SEO complet
- internal linking
- schema JSON-LD potrivita

## Estimare pentru toate calculatoarele

- tinta recomandata: `180 calculatoare`
- ritm recomandat: `10 calculatoare / batch`
- total estimat: `18 batch-uri`

## Batch 01

Primele 10 calculatoare complete:

1. `bmi`
2. `bmr`
3. `tdee`
4. `calorie-deficit`
5. `protein-intake`
6. `body-fat-us-navy`
7. `fuel-consumption`
8. `trip-fuel-cost`
9. `kw-cp`
10. `electricity-cost`

Articole suport pentru Batch 01:

1. `cum-interpretezi-bmi-corect`
2. `bmr-vs-tdee-diferente`
3. `cum-setezi-un-deficit-caloric`
4. `cate-proteine-ai-nevoie-zilnic`

## Batch 02

Al doilea lot finalizeaza celelalte 10 calculatoare deja prezente in registry si adauga suport editorial pentru ele.

Calculatoare:

1. `ideal-weight`
2. `water-intake`
3. `one-rep-max`
4. `cost-per-km`
5. `travel-time`
6. `amps-to-watts`
7. `watts-to-kwh`
8. `kg-lb`
9. `cm-inch`
10. `temperature-converter`

Articole suport:

1. `cum-calculezi-consumul-real-la-masina`
2. `cum-estimezi-costul-unei-calatorii-cu-masina`
3. `kw-vs-cp-explicat-simplu`
4. `cum-calculezi-consumul-electric-al-unui-aparat`
5. `ghid-conversii-kg-lb-cm-inch`
6. `cum-estimezi-procentul-de-grasime-corporala`
7. `cata-apa-ai-nevoie-zilnic-cu-adevarat`
8. `cum-folosesti-one-rep-max-in-antrenament`
9. `cost-pe-kilometru-vs-cost-total-drum`
10. `cum-transformi-amperii-in-wati-si-wati-in-kwh`

Obiective:

- inchidem primele 20 de calculatoare complete disponibile in produs
- acoperim mai bine clusterele `fitness`, `auto`, `energie` si `conversii`
- sustinem lotul cu redirect-uri pentru cateva URL-uri legacy deja observate live

URL-uri legacy recuperate in bootstrap:

1. `/calculator-imc` -> `/calculatoare/fitness/calculator-bmi-imc`
2. `/calculator-combustibil-consum-auto` -> `/calculatoare/auto/calculator-consum-combustibil`
3. `/calculator-kw-cp` -> `/calculatoare/energie/convertor-kw-in-cp`

## Batch 03

Batch rezervat pentru calculatoare noi, nu pentru cele deja existente in registry.

Directii candidate:

1. `beton-fundatie-volum`
2. `gestatie-caini`
3. `zile-libere`
4. `food-cost`
5. `marja-profit`

## Batch 04

Batch rezervat pentru extinderea clusterului `conversii` si pentru utilitare answer-first cu volum mare.

## Regula de operare

- `releaseBatch` marcheaza lotul editorial
- `editorialStatus` descrie progresul real al paginii
- doar `batch-01` este setat pentru publicare automata in seed-ul initial
- loturile urmatoare raman draft pana la review si aprobare
- redirect-urile legacy se pot publica direct atunci cand exista un inlocuitor clar si relevant
