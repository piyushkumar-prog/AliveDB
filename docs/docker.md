# Docker Guide

## Quick Start

```bash
git clone https://github.com/yourusername/alivedb.git
cd alivedb

# Edit docker/docker-compose.yml — update CRON_SECRET

docker compose -f docker/docker-compose.yml up -d
```

Open [http://localhost:3000](http://localhost:3000).

---

## Configuration

Edit `docker/docker-compose.yml`:

```yaml
environment:
  DATABASE_URL: "file:/app/data/alivedb.db"  # SQLite (default)
  PING_TIMEOUT_MS: "10000"
  PING_MAX_RETRIES: "2"
  CRON_SECRET: "your-strong-secret-here"     # ← Change this!
```

### Using Turso in Docker

If you prefer Turso over SQLite:

```yaml
environment:
  DATABASE_URL: "libsql://your-db.turso.io"
  DATABASE_AUTH_TOKEN: "your-token"
```

Remove the SQLite volume mount:
```yaml
# volumes:
#   - alivedb-data:/app/data
```

---

## Data Persistence

SQLite is stored in a Docker named volume (`alivedb-data`). It persists across container restarts and updates.

**Backup:**
```bash
docker run --rm -v alivedb-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/alivedb-backup.tar.gz /data
```

**Restore:**
```bash
docker run --rm -v alivedb-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/alivedb-backup.tar.gz -C /
```

---

## Updating

```bash
git pull
docker compose -f docker/docker-compose.yml up -d --build
```

---

## Behind Nginx (HTTPS)

```nginx
server {
    listen 443 ssl;
    server_name alivedb.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/alivedb.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alivedb.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Health Check

The container exposes a health check at `/api/stats`. Docker will automatically restart unhealthy containers.

```bash
docker ps  # Check STATUS column for "healthy"
```

---

## Cron in Docker

The Docker deployment uses the **standalone worker** (`worker/index.ts`) instead of Vercel Cron. It runs inside the same container and pings projects every hour using `node-cron`.

To use the worker alongside the web server, update the Docker `CMD`:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js & tsx worker/index.ts"]
```
