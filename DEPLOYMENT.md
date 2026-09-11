# Deployment Guide for Cricket Scorer

This guide covers how to deploy the Cricket Scorer application to production across various platforms.

---

## Architecture Overview

- **Backend**: FastAPI (Python 3.12, Uvicorn, Alembic, SQLAlchemy)
- **Database**: PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS

---

## Environment Variables Summary

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Example (Production) | Default |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime environment (`production` or `development`) | `production` | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://user:pass@ep-xyz.neon.tech/cricket_scorer?sslmode=require` | Local Postgres URL |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | `https://cricket.yourdomain.com,https://app.vercel.app` | Localhost origins |
| `PORT` | HTTP server port | `8000` | `8000` |
| `HOST` | HTTP server bind host | `0.0.0.0` | `0.0.0.0` |
| `COOKIE_SECURE` | Whether scorer session cookies require HTTPS | `true` | `false` (dev) / `true` (prod) |
| `COOKIE_SAMESITE` | Cookie SameSite policy (`lax` or `none`) | `none` (if frontend & backend are on different domains) | `lax` |
| `COOKIE_DOMAIN` | Cookie domain scope (optional) | `.yourdomain.com` | `None` |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Example (Production) | Default |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public backend API URL | `https://api.yourdomain.com` | `""` (proxied locally) |
| `VITE_PROXY_TARGET` | Backend target URL for Vite dev proxy | `http://127.0.0.1:8000` | `http://127.0.0.1:8000` |

> [!IMPORTANT]
> Because Vite embeds environment variables prefixed with `VITE_` at build time, set `VITE_API_BASE_URL` before running `npm run build` or configure it in your frontend hosting dashboard (Vercel, Netlify, etc.).

---

## Deployment Options

### Option 1: Docker Compose (Single VPS / Server)

If you have a Linux VPS (DigitalOcean, Hetzner, AWS EC2, etc.) with Docker installed:

1. Clone repository on your server:
   ```bash
   git clone <repo-url>
   cd cricket-scorer
   ```
2. Copy root environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with strong passwords and your domain:
   ```bash
   POSTGRES_PASSWORD=your_strong_secret_password
   CORS_ORIGINS=https://yourdomain.com
   COOKIE_SECURE=true
   ```
4. Build and start all services:
   ```bash
   docker compose up -d --build
   ```
   The database migrations (`alembic upgrade head`) execute automatically on backend container startup.

---

### Option 2: Render / Railway / Fly.io (Backend + Managed Postgres)

#### 1. Database Setup
- Create a PostgreSQL database on **Neon**, **Supabase**, **Render**, or **Railway**.
- Obtain the connection URI (e.g. `postgresql+psycopg://user:password@host/database`).
  *(Note: if the provider provides `postgres://` or `postgresql://`, use `postgresql+psycopg://` so SQLAlchemy psycopg driver connects).*

#### 2. Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Environment Variables**:
  - `ENVIRONMENT`: `production`
  - `DATABASE_URL`: `postgresql+psycopg://...`
  - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
  - `COOKIE_SECURE`: `true`
  - `COOKIE_SAMESITE`: `none` (required if frontend and backend have different domains)
- **Health Check Endpoint**: `/health`

---

### Option 3: Vercel / Netlify / Cloudflare Pages (Frontend)

1. Connect your repository to **Vercel** or **Netlify**.
2. Set configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure Environment Variable:
   - `VITE_API_BASE_URL`: The deployed backend URL (e.g. `https://cricket-scorer-api.onrender.com` without trailing slash).
4. Deploy!

---

## Running Database Migrations

To apply Alembic migrations against any database environment:

```bash
# In the backend directory:
DATABASE_URL="postgresql+psycopg://<user>:<password>@<host>:<port>/<dbname>" alembic upgrade head
```
Or simply set `DATABASE_URL` in `backend/.env` and run:
```bash
alembic upgrade head
```

---

## Verification & Health Check

After deployment, verify that the backend is healthy:

```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{"status": "ok", "environment": "production", "app": "Cricket Scorer"}
```

---

## Database Retention & Automated Cleanup

To prevent the free database from filling up over time, old matches and their associated events can be deleted automatically or via a CLI script.

### Method 1: Standalone CLI Script

You can run the script manually or configure it as a cron task:

```bash
# Delete matches older than 24 hours:
python scripts/cleanup_old_matches.py --hours 24

# Delete matches older than 7 days:
python scripts/cleanup_old_matches.py --days 7

# Preview what would be deleted without deleting anything (Dry Run):
python scripts/cleanup_old_matches.py --hours 48 --dry-run

# Delete only matches marked as 'COMPLETED':
python scripts/cleanup_old_matches.py --hours 24 --only-completed
```

### Method 2: Scheduled HTTP Webhook (Free via cron-job.org or GitHub Actions)

If using Render or cloud hosting, you can set an `ADMIN_API_KEY` in your environment variables:
```bash
ADMIN_API_KEY="your-secret-cleanup-key"
```

Then trigger the cleanup endpoint on a schedule via curl or any free cron scheduler (e.g. [cron-job.org](https://cron-job.org)):

```bash
curl -X POST "https://your-api.onrender.com/matches/maintenance/cleanup?hours=24" \
     -H "X-Admin-Key: your-secret-cleanup-key"
```

For complete step-by-step setup instructions with screenshots and alternate methods (GitHub Actions / Linux VPS), see the [Automated Database Cleanup Guide](file:///c:/Programming/cricket-scorer/CRON_CLEANUP_GUIDE.md).


