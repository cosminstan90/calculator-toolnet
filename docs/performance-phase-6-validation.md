# Faza 6 - Validation si Regression Checks

## Scope inchis

- smoke checks de deploy
- snapshot rapid de performanta pentru paginile etalon
- integrare in runbook-ul operational

## Ce am adaugat

### Smoke check

Comanda:

```bash
npm run ops:smoke-check
```

Verifica rapid:

- homepage
- hub-ul de calculatoare
- hub-ul de blog
- `/admin`
- `/api/health/content` daca exista token
- `/api/health/ops` daca exista token

Rezultatul este JSON si comanda pica cu exit code `1` daca unul dintre check-uri nu trece.

### Perf snapshot

Comanda:

```bash
npm run ops:perf-snapshot
```

Masoara timpii de raspuns pentru un set mic de pagini etalon:

- `/`
- `/calculatoare`
- `/blog`
- `/despre-noi`
- `/contact`

Output-ul este JSON cu rulaje multiple si medie pe fiecare ruta.

## Comenzi utile pe VPS

```bash
npm run ops:smoke-check
npm run ops:perf-snapshot
npm run ops:ops-report
```

## Obiectiv operational

Cu Faza 6 putem valida repede:

- aplicatia raspunde
- endpoint-urile de health sunt functionale
- admin-ul raspunde
- paginile publice cheie nu au regresii evidente
- avem un baseline simplu de timp de raspuns dupa deploy
