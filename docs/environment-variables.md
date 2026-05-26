# Environment Variables

## Complete Reference

### DATABASE_URL

**Required.** Database connection string.

| Environment | Format | Example |
|---|---|---|
| Local dev | `file:./dev.db` | `file:./dev.db` |
| Docker | `file:/app/data/alivedb.db` | Stored in persistent volume |
| Turso (production) | `libsql://[name]-[org].turso.io` | `libsql://alivedb-myorg.turso.io` |

---

### DATABASE_AUTH_TOKEN

**Required for Turso only.**

Your Turso database authentication token. Generate with:
```bash
turso db tokens create your-db-name
```

Not needed for SQLite file databases.

---

### CRON_SECRET

**Required in production.**

A strong random secret used to protect the `/api/cron/ping` endpoint from unauthorized access. On Vercel, the cron system automatically includes this in the `Authorization: Bearer` header.

Generate a secure value:
```bash
openssl rand -base64 32
```

---

### PING_TIMEOUT_MS

**Optional.** Default: `10000` (10 seconds)

Maximum time in milliseconds to wait for a ping response before timing out. Projects that exceed this threshold are marked as "warning".

Recommended range: `5000`–`30000`

---

### PING_MAX_RETRIES

**Optional.** Default: `2`

Maximum number of retry attempts after a failed ping. Each retry uses exponential backoff (1s, 2s). Set to `0` to disable retries.

---

### NEXT_PUBLIC_APP_URL

**Optional.** Default: `http://localhost:3000`

The base URL of your deployed AliveDB instance. Used for internal references.

Examples:
- `https://alivedb.yourdomain.com`
- `https://your-project.vercel.app`

---

### BASIC_AUTH_USER

**Optional.**

Username for HTTP Basic Authentication. If set alongside `BASIC_AUTH_PASSWORD`, it password-protects all pages and APIs (except `/api/cron/ping`). Leave empty to disable authentication (useful for local development).

---

### BASIC_AUTH_PASSWORD

**Optional.**

Password for HTTP Basic Authentication. If set alongside `BASIC_AUTH_USER`, it password-protects the application dashboard.

---

## Setting Variables

### Vercel
Go to: **Project Settings → Environment Variables**

### Local Development
Create `.env.local` (gitignored):
```bash
cp .env.example .env.local
# Edit .env.local
```

### Docker Compose
Set in `docker/docker-compose.yml` under `environment:`.

### Shell (temporary)
```bash
export DATABASE_URL="libsql://..."
export DATABASE_AUTH_TOKEN="..."
```
