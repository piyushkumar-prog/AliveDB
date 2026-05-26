# Deployment Guide

## Vercel (Recommended)

Vercel is the primary supported deployment target for AliveDB.

### Step 1 — Create a Turso Database

Turso is a free LibSQL/SQLite-compatible database that **never pauses on inactivity** — perfect for a keep-alive tool.

* **Option A: Via Turso Web UI (Easiest, no CLI installation needed)**
  1. Go to [turso.tech](https://turso.tech) and sign up / log in.
  2. Create a database named `alivedb`.
  3. Copy the connection **URL** -> this is your `DATABASE_URL`.
  4. Generate a **Token** from the database settings page -> this is your `DATABASE_AUTH_TOKEN`.

* **Option B: Via Turso CLI (macOS / Linux / WSL)**
  > [!NOTE]
  > On Windows, running the `curl` installer command directly in PowerShell will fail because `curl` is aliased to `Invoke-WebRequest` and `bash` is not present. You must run `wsl` in PowerShell first to enter your Linux subsystem, or use the Web UI option above.

  ```bash
  # Install Turso CLI
  curl -sSfL https://get.tur.so/install.sh | bash

  # Login & Create database
  turso auth login
  turso db create alivedb

  # Get connection details
  turso db show alivedb           # copy the URL -> DATABASE_URL
  turso db tokens create alivedb  # copy the token -> DATABASE_AUTH_TOKEN
  ```

### Step 2 — Deploy to Vercel

1. Fork this repository on GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your fork
3. Set the following environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `libsql://[your-db].turso.io` |
| `DATABASE_AUTH_TOKEN` | Your Turso token |
| `CRON_SECRET` | Run `openssl rand -base64 32` |

4. Deploy

### Step 3 — Run Database Migrations

After deployment, run migrations from your local machine:

```bash
# Set env vars locally (temporarily)
export DATABASE_URL="libsql://[your-db].turso.io"
export DATABASE_AUTH_TOKEN="your-token"

# Apply migrations
npm run db:migrate:prod
```

### Step 4 — Verify Cron

AliveDB's `vercel.json` configures a cron job that fires every hour:

```json
{
  "crons": [
    {
      "path": "/api/cron/ping",
      "schedule": "0 * * * *"
    }
  ]
}
```

Check it's working in **Vercel Dashboard → Cron Jobs**.

---

## Docker / VPS

See [docker.md](./docker.md) for Docker Compose deployment.

---

## Coolify / Dokploy {#coolify}

1. Create a new service → Docker Compose
2. Point to `docker/docker-compose.yml` in your fork
3. Set environment variables in the service config
4. Deploy

---

## Railway / Render {#railway}

1. Connect your GitHub repository
2. Set build command: `npm run build && npm run db:migrate:prod`
3. Set start command: `npm start`
4. Add environment variables
5. Add a persistent disk mounted at `/app/data` (for SQLite) or use Turso

---

## Coolify with Turso (Recommended for VPS)

For VPS deployments where you still want a managed database:

1. Deploy the Docker image
2. Set `DATABASE_URL` to your Turso URL
3. Set `DATABASE_AUTH_TOKEN`
4. Remove the SQLite volume mount from `docker-compose.yml`
