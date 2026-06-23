# Deploying Backend to Railway

This guide explains how to set up, configure, and deploy the `@yeu-pet/api` monorepo backend on [Railway](https://railway.app/).

---

## 1. Railway Services Setup

We recommend creating a single Railway Project containing the following services:

1. **PostgreSQL Database**
   - You can create a PostgreSQL service directly inside Railway (using the "+ New" -> "Database" -> "Add PostgreSQL" option).
   - Alternatively, you can use a Supabase database and copy the connection strings.
   
2. **Redis Service**
   - Create a Redis database service inside Railway ("+ New" -> "Database" -> "Add Redis").
   - This will be used by BullMQ in the NestJS application for background queues.

3. **Backend Service**
   - Create an empty service ("+ New" -> "Empty Service") and rename it to `api` (to match the `--service api` flag in our GitHub Actions workflow).

---

## 2. Backend Service Configuration (Railway Dashboard)

In your **`api` service** settings, configure the following:

### Build Settings
1. Go to **Settings** -> **General** -> **Root Directory** and ensure it is set to `/` (the root of the monorepo).
2. Go to **Settings** -> **Build** -> **Dockerfile Path** and set it to:
   ```text
   apps/api/Dockerfile
   ```
   *Note: This is critical because it tells Railway to build the image using the monorepo-compatible Dockerfile located inside the `apps/api` folder.*

### Networking
1. Go to **Settings** -> **Networking** -> **Generate Domain** to get a public URL for your API, or bind your custom domain.
2. Railway will automatically expose port `3000` as configured in the `Dockerfile`.

---

## 3. Environment Variables

In your **`api` service** under the **Variables** tab, add the following environment variables:

| Variable Name | Value / Notes |
| :--- | :--- |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `API_PREFIX` | `api` |
| `DATABASE_URL` | Connection pooling URL (e.g. `${{ PostgreSQL.DATABASE_URL }}` if using Railway PostgreSQL, or your Supabase connection string) |
| `DIRECT_URL` | Direct connection URL (if using Supabase) or same as `DATABASE_URL` |
| `REDIS_HOST` | `${{ Redis.REDISHOST }}` (References the Redis service host name automatically) |
| `REDIS_PORT` | `${{ Redis.REDISPORT }}` (References the Redis service port) |
| `JWT_SECRET` | A secure random string for JWT signing |
| `JWT_REFRESH_SECRET` | A secure random string for refresh tokens |
| `GOOGLE_APPLICATION_CREDENTIALS` | Paste the **entire JSON string** of your Firebase Service Account private key (starts with `{` and ends with `}`). The application is adapted to parse it directly. |
| `NOTIFICATION_CHANNEL` | `yeu-pet` |
| `REVENUECAT_WEBHOOK_SECRET` | Exact authorization header configured for the RevenueCat webhook |
| `REVENUECAT_SECRET_KEY` | Secret RevenueCat API key used for server-side subscriber verification |
| `REVENUECAT_PREMIUM_ENTITLEMENT_ID` | RevenueCat entitlement that maps to YeuPet Premium |

*Add any other variables from `apps/api/.env.example` as needed (e.g. Twilio, SMTP, Cloudinary).*

---

## 4. GitHub Actions Deployment Setup

To enable the automatic CI/CD deployment:

1. In the Railway Dashboard, go to **Project Settings** -> **Tokens**.
2. Click **Create Project Token**, choose the environment (e.g., `production`), and copy the generated token.
3. In your GitHub repository, navigate to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
4. Create a secret named **`RAILWAY_TOKEN`** and paste the project token.

Now, whenever you push changes to the `main` branch that affect the API backend or shared packages, the GitHub Action will automatically:
1. Run lint checks.
2. Build the API to ensure no compilation errors.
3. Install the Railway CLI and trigger the deployment using `railway up --service api --ci`.

---

## 5. Running Database Migrations

Because Prisma migrations should be run carefully, the workflow does not run them automatically. 

### Option A: Run manually before deploying
You can run migrations from your local machine pointing directly to the production database:
```bash
# From apps/api directory
DATABASE_URL="your_production_direct_database_url" pnpm prisma migrate deploy
```

### Option B: Automate during start (Not recommended for high-scale, but fine for development)
If you want Railway to run migrations automatically when the container boots, you can change the Start Command in the Railway Dashboard or update `apps/api/package.json` `"start:prod"` script to:
```json
"start:prod": "npx prisma migrate deploy && node dist/src/main.js"
```
