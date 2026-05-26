# Troubleshooting

## Common Issues

### "DATABASE_URL is not set"

Ensure you have created a `.env.local` file (for local dev) or set environment variables in your deployment platform.

```bash
cp .env.example .env.local
```

---

### "Prisma Client not generated"

Run:
```bash
npm run db:generate
# or
npx prisma generate
```

---

### Migrations not applied

```bash
# Local
npm run db:migrate

# Production
npm run db:migrate:prod
```

---

### Turso connection errors

1. Verify your `DATABASE_URL` starts with `libsql://`
2. Verify `DATABASE_AUTH_TOKEN` is set and not expired
3. Regenerate token: `turso db tokens create your-db`

---

### Cron job not firing on Vercel

1. Check **Vercel Dashboard → Cron Jobs** — it should show your `/api/cron/ping` route
2. Verify `CRON_SECRET` is set in Vercel environment variables
3. Check function logs for errors: **Vercel Dashboard → Functions → Logs**

---

### Ping always fails (SSRF error)

Your URL was blocked by SSRF protection. Ensure:
- The URL is publicly accessible (not `localhost`, `192.168.x.x`, etc.)
- The URL uses `http://` or `https://`
- The domain resolves to a public IP

---

### High response times

- Increase `PING_TIMEOUT_MS` (e.g., `30000` for slow cold-start services)
- Check if your Supabase project is in a distant region

---

### Projects not showing as "active" after ping

After a successful ping, the status updates to `active`. If it stays `pending`:
1. Check the activity feed for error messages
2. Verify the health endpoint returns a 2xx or 3xx status code

---

## Logs

### Next.js logs (Vercel)
Vercel Dashboard → Functions → your function → Logs

### Docker logs
```bash
docker compose -f docker/docker-compose.yml logs -f web
```

### Worker logs
```bash
docker compose -f docker/docker-compose.yml logs -f worker
```

---

## Resetting the Database

```bash
# Local — delete and recreate
rm prisma/dev.db
npm run db:migrate

# Turso — drop and recreate
turso db destroy alivedb
turso db create alivedb
npm run db:migrate:prod
```
