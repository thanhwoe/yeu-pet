# Yeu Pet API

NestJS backend for the Yeu Pet mobile app.

This is the active backend for authentication, pet care data, reminders, medical records, budget tracking, photos, notifications, sitter booking, subscriptions, and future Pet Care AI.

## Tech Stack

- NestJS
- Prisma
- PostgreSQL / Supabase
- Redis
- BullMQ
- Firebase Admin / Expo push integrations
- JWT authentication
- Cloudinary file upload

## Project Scope

The API should support the phase 1 product direction documented in `/docs`:

- pet management
- care reminders
- medical records
- pet budget
- photos and memories
- settings
- subscription entitlements
- sitter booking MVP
- Pet Care AI through backend-only provider calls

Do not call AI providers from the mobile app. Provider keys and model configuration belong in backend environment variables only.

## Database

Database schema and migrations are managed with Prisma in `prisma/schema.prisma` and `prisma/migrations`.

Before changing tables, indexes, constraints, triggers, or Supabase/PostgreSQL-specific SQL, read:

1. `/docs/00-agent-operating-guide.md`
2. `/docs/03-database-redesign-plan.md`
3. `/docs/09-testing-release-checklist.md`

Prefer additive, backward-compatible migrations when existing data may be present.

## Useful Commands

Run commands from the repository root unless noted otherwise.

```bash
# Start API in development mode
pnpm --filter @yeu-pet/api dev

# Build API
pnpm --filter @yeu-pet/api build

# Lint API
pnpm --filter @yeu-pet/api lint

# Run unit tests
pnpm --filter @yeu-pet/api test

# Run e2e tests
pnpm --filter @yeu-pet/api test:e2e

# Generate Prisma client
pnpm --filter @yeu-pet/api db:generate

# Create a Prisma migration
pnpm --filter @yeu-pet/api db:migrate <migration_name>
```

## Implementation Rules

- Read account id from the authenticated request, never from user-controlled body fields.
- Enforce ownership in services or repositories for every user-owned resource.
- Keep subscription and usage limits centralized in the entitlement service.
- Keep controllers thin: validate input, call services, return response DTOs.
- Add pagination or explicit limits to list endpoints.
- Keep AI safety disclaimers and urgent-case handling in backend logic.

## Documentation To Read First

1. `/AGENT_TASK_PROMPT.md`
2. `/docs/00-agent-operating-guide.md`
3. `/docs/04-backend-api-plan.md`
4. `/docs/06-subscriptions-entitlements.md`
5. `/docs/07-doctor-ai-plan.md`
