# Automated Database Cleanup Guide (Using Cron)

This guide walks you through setting up automated scheduled cleanup of old matches and events from your database so your free PostgreSQL storage (e.g. on Neon or Supabase) never fills up.

---

## How It Works

The backend provides a secure maintenance endpoint:
```http
POST /matches/maintenance/cleanup
```

### Supported Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `hours` | Query float | `24.0` | Deletes matches older than this many hours (e.g. `?hours=48` or `?hours=168` for 7 days) |
| `only_completed` | Query bool | `false` | If `true`, only deletes matches marked as `COMPLETED`. Ongoing/abandoned matches are kept. |
| `dry_run` | Query bool | `false` | If `true`, counts records that would be deleted without actually deleting them. |
| `X-Admin-Key` | Header string | *(optional)* | Secret key to authorize the request (matches `ADMIN_API_KEY` env var). |

---

## Step 1: Set `ADMIN_API_KEY` on Your Backend

To prevent unauthorized users from triggering cleanups:

1. Open your **Render Dashboard** (or whichever platform hosts your backend).
2. Click on your `cricket-scorer-api` service > **Environment**.
3. Add or update the environment variable:
   - **Key**: `ADMIN_API_KEY`
   - **Value**: Generate a random secure string (e.g. `cricket_clean_9f83a2bc1d84e567`)
4. Click **Save Changes** (Render will automatically redeploy).

> [!NOTE]
> If `ADMIN_API_KEY` is not set or empty, the endpoint does not require an authorization header (suitable for local testing, but recommended to set in production).

---

## Step 2: Schedule Cleanup with cron-job.org (100% Free)

[cron-job.org](https://cron-job.org) is a free, reliable web service that pings HTTP endpoints on a schedule.

### 1. Create a Free Account
1. Go to **[https://cron-job.org](https://cron-job.org)** and click **Sign Up** (it is completely free).
2. Verify your email address and log in.

### 2. Create a New Cronjob
Click the **"CREATE CRONJOB"** button and configure the following fields:

#### A. Title & URL
- **Title**: `Cricket Scorer - Daily Cleanup`
- **URL**: 
  ```
  https://your-api.onrender.com/matches/maintenance/cleanup?hours=24
  ```
  *(Replace `your-api.onrender.com` with your actual Render backend URL)*.

#### B. Schedule
- **Schedule**: Choose how often you want to clean up:
  - **Every day at midnight**: Select `Every day at 00:00` (UTC or your local time).
  - Or **Every Sunday**: Select `Every week on Sunday at 00:00`.

#### C. Request Method
- **Request Method**: Change from `GET` to **`POST`**.

#### D. Headers (Crucial for Authentication)
Click on **"Advanced"** or expand **"Headers"**:
- Add a new header:
  - **Header Name**: `X-Admin-Key`
  - **Header Value**: `your_secret_admin_key` *(the exact value you set in Step 1)*

#### E. Error Notifications & Logging
- Check **"Send email on failure"** so you receive an alert if the API ever fails.
- Enable **"Save execution history"** to see logs of each run.

### 3. Save & Test
1. Click **Create Cronjob**.
2. To test immediately, click the **Test run** button on your new cron job.
3. Check the response body. You should see a successful JSON response:
   ```json
   {
     "cutoff": "2026-09-10T16:20:00",
     "matches_found": 3,
     "deleted_matches": 3,
     "deleted_events": 48,
     "dry_run": false
   }
   ```

---

## Alternative Option: GitHub Actions (Free & Integrated)

If you prefer keeping your cron job directly inside your GitHub repository without signing up for third-party services:

### 1. Add Secret in GitHub
1. Go to your repository on GitHub: `https://github.com/EmotionalApe/quick_singles`
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**:
   - **Name**: `ADMIN_API_KEY`
   - **Value**: Your secret key from Step 1.
4. Click **Add secret**.

### 2. Create Workflow File
Create a file at `.github/workflows/cleanup-cron.yml`:

```yaml
name: Scheduled Database Cleanup

on:
  schedule:
    # Runs every day at 02:00 UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allows manual trigger from GitHub UI

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cleanup Endpoint
        run: |
          curl -X POST "https://your-api.onrender.com/matches/maintenance/cleanup?hours=24" \
            -H "X-Admin-Key: ${{ secrets.ADMIN_API_KEY }}" \
            --fail-with-body
```

---

## Alternative Option: Linux VPS Crontab (Self-Hosted)

If you are running the backend on your own server or VPS, you can run the Python script directly via Linux cron:

1. Open your server crontab:
   ```bash
   crontab -e
   ```
2. Add a line to run daily at 02:00 AM:
   ```bash
   0 2 * * * cd /path/to/cricket-scorer/backend && ./.venv/bin/python scripts/cleanup_old_matches.py --hours 24 >> /var/log/cricket_cleanup.log 2>&1
   ```

---

## Testing Cleanup Manually via cURL / PowerShell

Before enabling the schedule, you can test the endpoint anytime:

### Dry Run (Preview without deleting)

**cURL**:
```bash
curl -X POST "https://your-api.onrender.com/matches/maintenance/cleanup?hours=24&dry_run=true" \
     -H "X-Admin-Key: your_secret_admin_key"
```

**PowerShell**:
```powershell
Invoke-RestMethod -Method Post `
  -Uri "https://your-api.onrender.com/matches/maintenance/cleanup?hours=24&dry_run=true" `
  -Headers @{ "X-Admin-Key" = "your_secret_admin_key" }
```

Expected output:
```json
{
  "cutoff": "2026-09-10T21:50:00",
  "matches_found": 2,
  "deleted_matches": 0,
  "deleted_events": 0,
  "would_delete_matches": 2,
  "would_delete_events": 35,
  "dry_run": true
}
```
