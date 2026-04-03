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

Primul lot de calculatoare complet noi dupa inchiderea registry-ului initial.

Calculatoare:

1. `room-area`
2. `concrete-volume`
3. `paint-coverage`
4. `tile-coverage`
5. `laminate-flooring`
6. `food-cost`
7. `profit-margin`
8. `markup`
9. `break-even`
10. `roi`

Articole suport:

1. `cum-calculezi-suprafata-unei-camere-corect`
2. `cum-calculezi-volumul-de-beton-pentru-fundatie`
3. `cum-estimezi-necesarul-de-vopsea`
4. `cum-calculezi-necesarul-de-gresie-si-faianta`
5. `food-cost-explicat-pentru-horeca`
6. `marja-vs-markup-explicate-simplu`
7. `cum-calculezi-pragul-de-rentabilitate`
8. `cum-evaluezi-un-roi-fara-sa-fortezi-cifrele`

Obiective:

- deschidem doua clustere noi: `constructii` si `business`
- introducem tool-uri utile atat pentru persoane, cat si pentru firme mici
- sustinem lotul cu redirect pentru calculatorul legacy de beton deja vazut live

## Batch 04

Primul lot dedicat clusterului `finante`, cu accent pe procente, TVA, discount, economii si credite.

Calculatoare:

1. `percentage-of-number`
2. `percentage-change`
3. `reverse-percentage`
4. `discount`
5. `vat`
6. `reverse-vat`
7. `compound-interest`
8. `monthly-savings`
9. `savings-goal`
10. `loan-payment`

Articole suport:

1. `cum-calculezi-procentele-corect`
2. `procent-din-numar-vs-diferenta-procentuala`
3. `cum-calculezi-discountul-real`
4. `tva-inclus-vs-tva-exclus`
5. `cum-functioneaza-dobanda-compusa`
6. `cum-planifici-economii-lunare`
7. `cum-estimezi-un-obiectiv-de-economisire`
8. `cum-citesti-rata-lunara-la-un-credit`

Obiective:

- deschidem categoria noua `finante`
- acoperim cautari answer-first cu volum mare pentru persoane si firme mici
- legam organic procentele de discount, TVA, economii si rata de credit

## Batch 05

Primul lot dedicat verticalei `salarii-si-taxe`, cu accent pe compararea ofertelor, timpului de lucru si a diferentei dintre brut si net.

Calculatoare:

1. `salary-increase`
2. `hourly-rate`
3. `monthly-work-hours`
4. `annual-income`
5. `effective-tax-rate`

Articole suport:

1. `cum-calculezi-cresterea-salariala-corect`
2. `cum-transformi-salariul-lunar-in-tarif-orar`
3. `cate-ore-lucrezi-intr-o-luna-de-fapt`
4. `cum-citesti-diferenta-dintre-brut-net-si-taxare-efectiva`
5. `cum-estimezi-venitul-anual-fara-sa-amesteci-bonusurile-cu-salariul`

Obiective:

- deschidem categoria `salarii-si-taxe`
- acoperim un cluster foarte bun atat pentru persoane, cat si pentru firme
- construim pagini sigure, explicabile si usor de extins ulterior spre payroll si fiscalitate mai avansata

## Regula de operare

- `releaseBatch` marcheaza lotul editorial
- `editorialStatus` descrie progresul real al paginii
- `editorialChecklist` arata concret ce este gata si ce mai lipseste
- `editorialCompletion` ofera un procent rapid de completare in admin
- doar `batch-01` este setat pentru publicare automata in seed-ul initial
- loturile urmatoare raman draft pana la review si aprobare
- redirect-urile legacy se pot publica direct atunci cand exista un inlocuitor clar si relevant
