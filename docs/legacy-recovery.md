# Legacy URL Recovery

Lista de mai jos ne ajuta sa recuperam semnalul SEO de pe URL-uri istorice deja vazute live sau indexate.

## Redirect-uri implementate deja in bootstrap

1. `/calculator-imc` -> `/calculatoare/nutritie-si-antrenament/calculator-bmi-imc`
2. `/calculator-combustibil-consum-auto` -> `/calculatoare/auto/calculator-consum-combustibil`
3. `/calculator-kw-cp` -> `/calculatoare/energie/convertor-kw-in-cp`
4. `/calculator-beton-fundatie-volum` -> `/calculatoare/constructii/calculator-volum-beton`

Aceste redirect-uri se pot crea automat prin:

```bash
npm run ops:bootstrap-cms -- --force
```

## Candidate bune pentru loturi viitoare

Aceste URL-uri merita evaluate separat. Nu trebuie redirectate spre o pagina partial relevanta doar pentru a evita un 404.

1. `/calculator-gestatie-caini`
2. `/zile-libere-2026`

## Regula de lucru

- daca exista echivalent clar in produsul nou, folosim `308`
- daca nu exista echivalent clar, lasam URL-ul in monitorizarea `not-found-events`
- construim pagina noua doar cand avem formula, UX, continut si FAQ complete
