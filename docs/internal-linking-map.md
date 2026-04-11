# Internal Linking Map

## Regula de baza

Nu legam paginile doar pentru crawl. Le legam pentru urmatorul pas logic al utilizatorului.

Ordinea buna este:

1. `hub`
2. `calculator principal`
3. `articol de interpretare`
4. `calculator complementar`

## Credite si economii

### Traseu principal

- hub -> `calculator-cost-total-credit`
- hub -> `calculator-rata-maxima-suportabila`
- `calculator-cost-total-credit` -> `cum-citesti-costul-total-al-unui-credit`
- `calculator-cost-total-credit` -> `calculator-rata-maxima-suportabila`
- `calculator-rata-maxima-suportabila` -> `calculator-grad-de-indatorare`
- `calculator-economie-refinantare` -> `cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna`
- `calculator-fond-de-urgenta` -> `cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati`

### Anchor patterns

- `Vezi si costul total al creditului`
- `Compara rezultatul cu rata pe care o poti sustine`
- `Daca vrei scenariul complet, verifica si refinantarea`

## Energie pentru casa

### Traseu principal

- hub -> `calculator-factura-curent`
- hub -> `calculator-consum-aparat-electric`
- hub -> `calculator-necesar-sistem-fotovoltaic`
- `calculator-factura-curent` -> `cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile`
- `calculator-consum-aparat-electric` -> `calculator-factura-curent`
- `calculator-necesar-sistem-fotovoltaic` -> `calculator-productie-fotovoltaica`
- `calculator-productie-fotovoltaica` -> `calculator-amortizare-panouri-fotovoltaice`
- `calculator-amortizare-panouri-fotovoltaice` -> `cum-citesti-amortizarea-unui-sistem-fotovoltaic`

### Anchor patterns

- `Vezi cat inseamna asta in factura lunara`
- `Continua cu productia estimata`
- `Interpreteaza amortizarea intr-un ghid separat`

## Imobiliare

### Traseu principal

- hub -> `calculator-cost-total-achizitie-locuinta`
- hub -> `calculator-pret-pe-mp`
- hub -> `calculator-chirie-vs-cumparare`
- `calculator-cost-total-achizitie-locuinta` -> `ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte`
- `calculator-cost-total-achizitie-locuinta` -> `calculator-buget-lunar-locuinta`
- `calculator-chirie-vs-cumparare` -> `chirie-vs-cumparare-cum-compari-corect-doua-scenarii`
- `calculator-randament-chirie` -> `cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse`
- `calculator-randament-chirie` -> `calculator-costuri-recurente-proprietate`
- `calculator-buget-renovare` -> `cum-estimezi-un-buget-de-renovare-fara-optimism-periculos`

### Anchor patterns

- `Vezi costul total, nu doar pretul de lista`
- `Compara cu scenariul chirie versus cumparare`
- `Daca investesti, verifica si randamentul ramas dupa costuri`

## Reguli editoriale

- fiecare articol important are minimum:
  - `1` link spre hub
  - `1` link spre calculator principal
  - `1` link spre calculator complementar
- fiecare calculator important are minimum:
  - `1` link spre articol de interpretare
  - `1` link spre alt calculator din acelasi subcluster
- hub-ul trebuie sa aiba:
  - bloc answer-first
  - bloc cu intrebari prioritare
  - bloc de `next step`
