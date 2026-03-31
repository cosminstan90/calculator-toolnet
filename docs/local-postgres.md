# PostgreSQL local

Pentru setup rapid local:

1. Porneste PostgreSQL.
2. Ruleaza:

```bash
psql -U postgres -f scripts/setup-local-db.sql
```

3. Copiaza `.env.example` in `.env` si seteaza:

```env
DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:5432/calculatoare_online
```

4. Creeaza primul user in Payload, apoi ruleaza:

```bash
npm run ops:bootstrap-cms
```
