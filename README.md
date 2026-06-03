# AliveDB

![AliveDB Header](./public/alivedb.png)

> Minimal self-hosted keep-alive monitoring for Supabase projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/piyushkumar-prog/AliveDB)

AliveDB is an open-source, self-hosted platform that prevents your Supabase projects from going into paused mode by automatically pinging configured endpoints at set intervals. It runs entirely on your own infrastructure — no subscriptions, no vendor lock-in, no telemetry.

---

## Features

- **Automated Keep-Alive** — Pings your Supabase endpoints on a schedule (6h, 12h, 24h, or custom cron)
- **Vercel Cron Jobs** — First-class Vercel deployment with native cron support
- **SSRF Protection** — Blocks requests to private IP ranges, loopback, and cloud metadata endpoints
- **Analytics Dashboard** — Uptime history, response time charts, and activity feed
- **Downtime Detection** — Detects timeouts, HTTP failures, and DNS errors
- **Manual Ping** — Trigger a ping at any time with rate limiting
- **Pause / Resume** — Temporarily stop monitoring individual projects
- **Docker Support** — Full Docker Compose setup for self-hosting
- **Zero Auth / Optional Password Access** — No database login. Optionally protect your hosted dashboard with a password via environment variables.
- **Open Source** — MIT licensed, fully auditable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| ORM | Prisma |
| Database | SQLite (local) / Turso (production) |
| Charts | Recharts |
| Validation | Zod |
| Containerization | Docker |

---

## Database & Hosting Flexibility

Choosing your hosting environment, deployment model, and database engine is **entirely your decision**. AliveDB is designed with high portability and architectural independence in mind:

*   **Self-Hosted SQLite (Docker / VPS / Local):** Perfect if you want to keep everything self-contained, under your direct control, with zero external service dependencies. SQLite stores data locally (configured via docker volumes or single VPS folders).
*   **Turso (Serverless / Cloud / LibSQL):** Ideal for deployments on serverless environments (like Vercel or Netlify) where local file storage is ephemeral and reset between requests or builds.
*   **Other Databases (PostgreSQL, MySQL, etc.):** Because AliveDB uses [Prisma](file:///d:/AliveDB/prisma/schema.prisma) as its database layer, you are not locked into SQLite or Turso. You can customize the datasource provider inside [schema.prisma](file:///d:/AliveDB/prisma/schema.prisma) to target any database engine supported by Prisma (PostgreSQL, MySQL, CockroachDB, SQL Server, etc.) to match your self-hosting infrastructure.

---

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. **Fork this repository**

2. **Create a Turso database** (free, never pauses on inactivity):
   * **Option A: Via Turso Web UI (Easiest, no CLI needed)**
     1. Go to [turso.tech](https://turso.tech) and sign up / log in.
     2. Create a database named `alivedb`.
     3. Copy the connection **URL**.
     4. Generate a **Token** from the database settings page.
   * **Option B: Via Turso CLI (macOS / Linux / WSL)**
     > [!NOTE]
     > On Windows, running the `curl` installer command directly in PowerShell will fail because `curl` is aliased to `Invoke-WebRequest` and `bash` is not present. You must run `wsl` in PowerShell first to enter your Linux subsystem, or use the Web UI option above.

     ```bash
     # Install Turso CLI
     curl -sSfL https://get.tur.so/install.sh | bash

     # Log in & create database
     turso auth login
     turso db create alivedb

     # Get connection details
     turso db show alivedb           # copy the URL
     turso db tokens create alivedb  # copy the token
     ```

3. **Deploy to Vercel:**
    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/piyushkumar-prog/AliveDB)

4. **Set environment variables** in Vercel dashboard:
   ```
   DATABASE_URL=libsql://[your-db].turso.io
   DATABASE_AUTH_TOKEN=your-turso-token
   CRON_SECRET=your-strong-random-secret
   ```

5. **Run database migrations:**
   Since Vercel does not run database migrations automatically, you can apply them in one of two ways:

   * **Option A: Automatically during Vercel Build (Recommended)**
     In your Vercel Dashboard, go to **Settings** > **General** > **Build & Development Settings**. Override the **Build Command** to:
     ```bash
     npm run db:migrate:prod && npm run build
     ```
     *(This ensures your Turso database schema is always kept up to date on every deployment automatically).*

   * **Option B: Manually from your local machine**
     Temporarily set the production environment variables and run the migrations from your local terminal:
     * **Windows (PowerShell):**
       ```powershell
       $env:DATABASE_URL="libsql://[your-db].turso.io"
       $env:DATABASE_AUTH_TOKEN="your-turso-token"
       npm run db:migrate:prod
       ```
     * **macOS / Linux / Git Bash:**
       ```bash
       DATABASE_URL="libsql://[your-db].turso.io" DATABASE_AUTH_TOKEN="your-turso-token" npm run db:migrate:prod
       ```

That's it. AliveDB is live.

---

### Option 2: Local Development

**Prerequisites:** Node.js 20+, npm

```bash
# Clone the repository
git clone https://github.com/piyushkumar-prog/AliveDB.git
cd alivedb

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local — DATABASE_URL defaults to SQLite file (zero setup)

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Option 3: Docker

```bash
# Clone and configure
git clone https://github.com/piyushkumar-prog/AliveDB.git
cd alivedb

# Edit docker/docker-compose.yml — set CRON_SECRET

# Start
docker compose -f docker/docker-compose.yml up -d
```

Open [http://localhost:3000](http://localhost:3000).

SQLite data persists in a Docker volume (`alivedb-data`).

---

## Step-by-Step Dashboard Setup

Once your AliveDB instance is running (locally, via Docker, or deployed on Vercel), you can add and monitor your Supabase projects using the web interface. Follow these steps to configure your first project:

1. **Access the Dashboard**
   Open your browser and navigate to your AliveDB instance (e.g., `http://localhost:3000` or your Vercel deployment URL).

2. **Add a New Project**
   * Click the **Add Project** button in the top-right corner of the page.
   * You will be presented with the configuration form.

3. **Configure Project Details**
   * **Project Name**: Enter a descriptive name for your project (e.g., `My Supabase Production` or `Staging App`).
   * **Project URL**: Enter the base URL of your Supabase project. You can find this in your Supabase Dashboard under **Project Settings > API**. It usually looks like:
     ```
     https://[your-project-ref].supabase.co
     ```
   * **Health Endpoint**: The URL path that AliveDB will ping.
     * **`/rest/v1/` (Supabase API — Recommended)**: Pings the PostgREST API endpoint. When combined with a Supabase Anon Key (see below), this triggers a real database query that counts as activity.
     * **`/` (Root)**: Pings the root URL of your project. Returns a public `200 OK` but **does not trigger a database query**.
     * **`/auth/v1/health` (Supabase Auth)**: Returns a `200 OK` from GoTrue but **does not trigger a database query**.
     * **Custom Path**: If you have a custom API route or Edge Function that runs database queries (e.g., `/functions/v1/health`), you can input that here.
     > [!CAUTION]
     > **Important: Unauthenticated pings do NOT prevent Supabase pausing!**
     > Supabase pauses projects after 7 days of **database inactivity** — not HTTP inactivity. Pinging `/rest/v1/` without an API key returns `401 Unauthorized`, which is rejected at the API gateway **before reaching the database**. This does NOT reset the inactivity timer.
     > 
     > **You must provide your Supabase Anon Key** (see below) so pings are authenticated and actually query the database.
   * **Supabase Anon Key** *(recommended)*: Your project's public `anon` key. Find it in **Supabase Dashboard → Settings → API → Project API keys → `anon` `public`**. When provided, AliveDB sends proper `apikey` and `Authorization` headers so the request passes through the API gateway and actually reaches your database.
   * **Ping Interval**: Select how frequently AliveDB should wake up your project.
     * Options: `Every 6 hours`, `Every 12 hours`, `Every 24 hours`, or a custom cron expression (e.g. `0 0 * * *`).
     * *Since Supabase pauses inactive projects after 7 days, checking once or twice a day (e.g., every 12 or 24 hours) is highly recommended and sufficient to keep it alive.*
   * **HTTP Method**:
     * **`GET` (Recommended)**: Performs a full request. Best for standard health checks and ensuring the page executes completely.
     * **`HEAD`**: Requests only headers. Lightweight and consumes less bandwidth.

4. **Save and Verify**
   * Click the **Add Project** button at the bottom of the form.
   * You will be redirected back to the dashboard, where your new project will appear.
   * Click the **Ping Now** button on your project's card to run an immediate manual ping to verify the setup. The response time, status code, and uptime chart will update instantly.
   * **Verify you see `200 OK`** in the logs (not `401 Unauthorized`). A `200` confirms the ping is reaching the database.

---

## Password Protection (Optional)

By default, AliveDB runs in open access mode (no login required) for easy local development. 

To protect your hosted dashboard, you can enable a secure custom login page by setting two environment variables:

* **`BASIC_AUTH_USER`** — The username to sign in with (e.g., `admin`).
* **`BASIC_AUTH_PASSWORD`** — A strong password of your choice.

Once configured:
- All dashboard pages will be automatically protected.
- Visitors will be redirected to a custom login screen.
- A secure, HTTP-only session cookie is set in the browser upon successful login.
- A **Sign out** action button will appear in the sidebar footer.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `file:./dev.db` | Database connection string |
| `DATABASE_AUTH_TOKEN` | Turso only | — | Turso auth token |
| `CRON_SECRET` | ✅ (prod) | — | Secret to protect cron endpoint |
| `PING_TIMEOUT_MS` | ❌ | `10000` | Ping timeout in milliseconds |
| `PING_MAX_RETRIES` | ❌ | `2` | Max retry attempts per ping |
| `NEXT_PUBLIC_APP_URL` | ❌ | `http://localhost:3000` | Your deployed app URL |
| `BASIC_AUTH_USER` | ❌ | — | Optional username for dashboard password protection |
| `BASIC_AUTH_PASSWORD` | ❌ | — | Optional password for dashboard password protection |

See [`.env.example`](./.env.example) for full documentation.

---

## External Cron Backup (Recommended for Vercel Hobby)

Vercel Hobby plan limits cron jobs to **once per day**. If a single execution fails, your Supabase project may go 48+ hours without a ping. AliveDB provides an `/api/keepalive` endpoint that you can call from **free external cron services** as a redundant trigger:

### Option A: cron-job.org (Free)
1. Sign up at [cron-job.org](https://cron-job.org)
2. Create a cron job with:
   * **URL**: `https://your-alivedb.vercel.app/api/keepalive`
   * **Schedule**: Every 6 hours (or your preferred interval)
   * **Headers**: Add `Authorization: Bearer YOUR_CRON_SECRET`

### Option B: UptimeRobot (Free)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add an HTTP(s) monitor with:
   * **URL**: `https://your-alivedb.vercel.app/api/keepalive`
   * **Monitoring Interval**: 6 hours
   * **HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

### Option C: GitHub Actions
Create `.github/workflows/keepalive.yml` in your repository:
```yaml
name: AliveDB Keepalive
on:
  schedule:
    - cron: '0 */6 * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -f -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-alivedb.vercel.app/api/keepalive
```

---

## How It Works

```
┌─────────────────────────────────────┐   ┌─────────────────────────────────┐
│      Vercel Cron (daily)            │   │  External Cron (cron-job.org,   │
│      GET /api/cron/ping             │   │  UptimeRobot, GitHub Actions)   │
└────────────────┬────────────────────┘   │    GET /api/keepalive           │
                 │                        └───────────────┬─────────────────┘
                 └──────────────┬──────────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────────┐
              │          Scheduler Logic             │
              │   Checks which projects are due      │
              │   based on interval + lastPingedAt   │
              └────────────────┬─────────────────────┘
                               │
                               ▼
              ┌─────────────────────────────────────┐
              │           SSRF Guard                 │
              │   Validates URLs against blocklist   │
              │   Checks resolved DNS IPs            │
              └────────────────┬─────────────────────┘
                               │
                               ▼
              ┌─────────────────────────────────────┐
              │           Ping Engine                │
              │   HTTP GET/HEAD with timeout          │
              │   Retry with exponential backoff      │
              │   Sends Supabase apikey + Bearer      │
              │   headers when anon key is provided   │
              └────────────────┬─────────────────────┘
                               │
                               ▼
              ┌─────────────────────────────────────┐
              │           Turso / SQLite             │
              │   Stores PingLog + updates Project   │
              │   status, lastPingedAt, nextPingAt   │
              └─────────────────────────────────────┘
```

---

## Project Structure

```
alivedb/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── projects/           # Project pages
│   │   └── page.tsx            # Dashboard
│   ├── components/             # UI components
│   ├── lib/                    # Core logic
│   │   ├── db.ts               # Prisma + Turso client
│   │   ├── ping-engine.ts      # HTTP pinger
│   │   ├── ssrf-guard.ts       # SSRF protection
│   │   └── scheduler.ts        # Interval logic
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── worker/
│   └── index.ts                # Optional standalone worker (Docker)
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/                       # Documentation
```

---

## Security

AliveDB implements SSRF protection to prevent it from being used to probe internal network resources:

- Blocks RFC 1918 private IP ranges (10.x, 172.16-31.x, 192.168.x)
- Blocks loopback addresses (127.x, ::1)
- Blocks cloud metadata endpoints (169.254.169.254, metadata.google.internal)
- Allows only `http://` and `https://` protocols
- Resolves DNS and checks all returned IPs before making requests
- Rate limits manual pings to prevent abuse

See [SECURITY.md](./SECURITY.md) for full security documentation.

---

## Deployment Guides

- [Vercel Deployment](./docs/deployment.md#vercel)
- [Docker / VPS](./docs/docker.md)
- [Coolify / Dokploy](./docs/deployment.md#coolify)
- [Railway / Render](./docs/deployment.md#railway)

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT — see [LICENSE](./LICENSE).
