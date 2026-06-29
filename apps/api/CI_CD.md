# API CI/CD

This backend uses two GitHub Actions workflows:

- `API CI`: runs on pull requests and pushes to `main` that touch backend/shared files.
- `API Docker Deploy`: builds the API Docker image and pushes it to GitHub Container Registry (GHCR). It can also deploy over SSH if server secrets are configured.

## CI Checks

The CI workflow runs:

```bash
pnpm install --frozen-lockfile
pnpm --filter @yeu-pet/api lint:check
pnpm --filter @yeu-pet/api build
docker build -f apps/api/Dockerfile -t yeu-pet-api:ci .
```

`lint:check` is intentionally separate from `lint` because `lint` uses `--fix` for local development.

Unit tests are not enabled in CI yet. The current generated Nest specs compile under Jest, but most fail at dependency injection because they do not mock repositories/services. Add proper providers or module imports in those specs, then add this step back to the workflows:

```bash
pnpm --filter @yeu-pet/api test -- --runInBand
```

## Image Registry

The deploy workflow publishes:

```text
ghcr.io/<github-owner>/yeu-pet-api:latest
ghcr.io/<github-owner>/yeu-pet-api:sha-<commit>
```

No extra token is required for GHCR because the workflow uses GitHub's built-in `GITHUB_TOKEN`.

## Required Runtime Environment

Your production server still needs an `.env` equivalent with the values from `.env.example`, especially:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_HOST`
- `REDIS_PORT`
- Infobip, Cloudinary, Resend, and Firebase credentials if those features are enabled

Do not commit real secrets to the repository.

## Optional SSH Deploy

To enable the manual `Deploy over SSH` step, add these repository secrets:

- `API_SSH_HOST`
- `API_SSH_USER`
- `API_SSH_KEY`
- `API_SSH_PORT` (optional)
- `API_DEPLOY_PATH`

The server directory should contain a production `docker-compose.yml` that uses the published image, for example:

```yaml
services:
  api:
    image: ghcr.io/YOUR_GITHUB_OWNER/yeu-pet-api:latest
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy noeviction
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped

volumes:
  redis_data:
```

If you use Supabase for PostgreSQL, run migrations deliberately before or during release:

```bash
cd apps/api
pnpm prisma migrate deploy
```

The workflow does not run production migrations automatically because that should be tied to your hosting environment and rollback process.
