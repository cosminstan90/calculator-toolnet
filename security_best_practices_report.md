# Security Best Practices Report

## Executive Summary
Am facut un review de securitate pentru stack-ul Next.js + Payload CMS + PostgreSQL al proiectului `calculatoare-online`, pe baza codului local. Doua probleme importante au fost deja remediate in acest pas: validarea redirect-urilor interne si blocarea secretelor/fallback-urilor nesigure in productie reala. Raman deschise trei zone care merita urmarite in urmatorul sprint: policy de security headers, wildcard-ul pentru remote images si hardening suplimentar pentru endpoint-urile interne cu token.

## Remediated Findings

### SEC-001
- Severity: High
- Status: Fixed
- Rule ID: NEXT-SECRETS-001 / NEXT-DEPLOY-001
- Location: `src/cms.config.ts:18-34`
- Evidence: configuratia Payload avea fallback-uri hardcoded pentru `DATABASE_URI` si `PAYLOAD_SECRET`, inclusiv secretul placeholder `replace-with-a-secure-production-secret`.
- Impact: daca aceeasi configuratie ajungea in productie fara env-uri explicite, sesiunea CMS si alte mecanisme dependente de secret puteau rula cu un secret predictibil.
- Fix applied: am adaugat un guard care blocheaza rularea in productie reala daca lipsesc `DATABASE_URI` sau `PAYLOAD_SECRET`, cu exceptie pentru build/local `localhost`.
- Residual note: pentru productie, `.env` trebuie setat explicit in VPS/PM2.

### SEC-002
- Severity: Medium
- Status: Fixed
- Rule ID: NEXT-REDIRECT-001
- Location: `src/lib/routing.ts:14-28`, `src/lib/routing.ts:73-81`, `src/cms/collections/Redirects.ts:28-45`
- Evidence: redirect-urile din CMS acceptau liber `destinationPath`, iar catch-all route redirectiona direct catre acea valoare.
- Impact: un path extern sau ambiguu putea transforma ruta intr-un open redirect controlat editorial, util pentru phishing sau trust abuse.
- Fix applied: am introdus `isSafeInternalPath()` la runtime si validare in colectia `redirects`, astfel incat doar path-uri interne relative care incep cu `/` sunt acceptate.
- Residual note: redirect-urile deja existente in baza ar trebui reverificate dupa ce PostgreSQL este disponibil.

## Open Findings

### SEC-003
- Severity: Medium
- Rule ID: NEXT-HEADERS-BASELINE-001
- Location: `next.config.ts:4-16`
- Evidence: configuratia Next nu defineste `headers()` si nu aplica explicit CSP, `X-Content-Type-Options`, `Referrer-Policy` sau o politica de framing.
- Impact: aplicatia depinde de configuratia infrastructurii pentru aceste protectii. Daca reverse proxy-ul nu le adauga, browserul ramane fara un baseline important de defense-in-depth.
- Fix: adauga un set minim de security headers in `next.config.ts` sau documenteaza si valideaza explicit ca proxy-ul/VPS-ul le seteaza deja.
- False positive note: daca nginx sau un edge proxy le adauga deja, severitatea scade, dar trebuie verificat runtime.

### SEC-004
- Severity: Medium
- Rule ID: NEXT-FETCH-SSRF-DEFENSE-001
- Location: `next.config.ts:6-15`
- Evidence: `images.remotePatterns` permite `http` si `https` pentru hostname `**`.
- Impact: chiar daca proiectul nu foloseste momentan `next/image`, configuratia ramane prea permisiva si poate deveni un risc daca in viitor se introduc imagini externe controlate editorial sau de utilizatori.
- Fix: treci la o allowlist explicita de host-uri sau la o configuratie bazata pe env pentru domeniile aprobate.
- False positive note: in starea actuala, riscul este latent, nu observat activ in UI.

### SEC-005
- Severity: Medium
- Rule ID: NEXT-INTERNAL-ENDPOINT-HARDENING-001
- Location: `src/app/api/internal/bootstrap/cms/route.ts:9-19`, `src/app/api/internal/import/content/route.ts:5-27`, `src/app/api/internal/seo/audit/route.ts:12-20`
- Evidence: endpoint-urile interne cu impact mare sunt protejate prin token header, dar nu au rate limiting similar cu `src/app/api/search/suggest/route.ts:2-10` si nici o restrictie suplimentara de origine/retea vizibila in cod.
- Impact: daca un token operational este expus accidental, endpoint-urile pot fi abuzate fara frictiune suplimentara pentru bootstrap, import sau audit.
- Fix: adauga rate limiting si, ideal, restrictionare la localhost/VPN/reverse proxy intern pentru endpoint-urile de ops.
- False positive note: daca accesul este deja limitat la nivel de nginx/firewall/VPN, riscul runtime scade, dar nu este documentat in cod.

## Environment Limitations
- PostgreSQL nu este instalat sau pornit in acest mediu, deci nu am validat continutul real din CMS.
- Review-ul a fost facut pe codul local si pe comportamentul local al aplicatiei, nu pe un deployment public.

## Recommended Next Fix Order
1. Adaugare security headers baseline.
2. Restrangere `images.remotePatterns` la allowlist.
3. Hardening suplimentar pentru endpoint-urile interne de ops.
