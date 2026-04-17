# Healthcare CRM

Healthcare CRM is a Next.js 16 + Prisma application for multi-tenant clinic operations. It includes staff authentication, RBAC, patient management, appointments, encounters, labs, billing, communications, audit logging, patient portal access, and low-rate live vitals streaming.

This repository is suitable for local evaluation, product exploration, and architecture review. It is not presented as a turnkey HIPAA-compliant production deployment.

## Features

- Multi-tenant organization scoping across app and API routes
- Staff authentication with Auth.js and role-based access control
- Separate patient portal login and revocable patient sessions
- Patients, appointments, encounters, tasks, labs, inventory, billing, payments, documents, consents, waitlist, and campaigns
- Append-only audit logging for mutating workflows
- Optional application-layer encryption for selected sensitive patient and emergency-contact fields
- Server-Sent Events live vitals stream for the patient portal
- Staff-authenticated FHIR proxy boundary for upstream EHR integration
- Docker-based local runtime with Postgres and Redis

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Auth.js / NextAuth
- Stripe
- Twilio + Nodemailer

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Run migrations and seed demo data:

```bash
npx prisma migrate deploy
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

5. Open:

- Staff login: `http://localhost:3000/login`
- Patient portal login: `http://localhost:3000/patient-login`

## Docker

This repo also supports a containerized local setup:

```bash
docker compose up --build
```

The compose path starts:

- `web`
- `postgres`
- `redis`

and runs `prisma migrate deploy` before launching the app.

## Environment

Required for normal local usage:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `NEXTAUTH_SECRET`: secret used to sign Auth.js JWTs and session data
- `NEXTAUTH_URL`: canonical application URL such as `http://localhost:3000`

Optional:

- `REDIS_URL`: Redis connection string for queue-oriented future work
- `WS_URL`: external realtime endpoint for future websocket-style clients
- `ENCRYPTION_KEY`: application-layer encryption key for sensitive patient/contact fields
- `FHIR_BASE_URL`: base URL for an upstream FHIR R4 server
- `FHIR_AUTH_TOKEN`: optional bearer token for the upstream FHIR server
- `STRIPE_SECRET_KEY`: required for payment intent creation
- `STRIPE_WEBHOOK_SECRET`: required for Stripe webhook verification

See [.env.example](./.env.example) for the current env template.

## Demo Data and Credentials

The seed creates:

- 3 staff users
- 5 patient portal accounts
- patients, appointments, encounters, notes, vitals, prescriptions, labs
- invoices, payments, tasks, communications, campaigns
- inventory items and transactions
- documents, consents, waitlist entries
- audit log history

Staff logins:

- `admin@acmeclinic.com` / `admin123`
- `ops@acmeclinic.com` / `admin123`
- `billing@acmeclinic.com` / `admin123`

Patient portal logins:

- `john.doe@example.com` / `patient123` / `MRN-1001`
- `jane.smith@example.com` / `patient123` / `MRN-1002`
- `alice.j@example.com` / `patient123` / `MRN-1003`
- `marcus.lee@example.com` / `patient123` / `MRN-1004`
- `priya.patel@example.com` / `patient123` / `MRN-1005`

These credentials are for local testing only.

## Verification

Useful project checks:

```bash
npm run lint
npm run typecheck
npx prisma validate --schema prisma/schema.prisma
SKIP_DB_INIT=true npm run build
```

## Architecture Notes

- App and API routes are protected through the Next.js proxy layer in `src/proxy.ts`
- Staff auth uses Auth.js session context for `userId` and `organizationId`
- Patient portal auth uses a separate `patient_session` cookie and DB-backed session records
- Audit logging is append-only and backed by a DB trigger
- Sensitive patient/contact fields can be stored encrypted on write when `ENCRYPTION_KEY` is configured
- Live vitals use SSE via `/api/vitals/stream`
- FHIR support is currently a staff-authenticated upstream proxy, not a full sync engine

## Security Posture

- TLS is required in production
- This project is not a claim of HIPAA compliance by itself
- Managed encrypted Postgres and deployment hardening are still deployment responsibilities
- Application-layer encryption is implemented for selected patient and emergency-contact fields
- Staff and patient sessions are separated to reduce privilege confusion
- Logs are routed through redacted safe loggers for app flows

## Documentation

- [Feature Walkthrough](./docs/feature-walkthrough.md)
- [Vitals Ingest Contract](./docs/vitals-ingest-contract.md)
- [Hardening Plan](./docs/superpowers/plans/2026-04-09-healthcare-crm-hardening.md)
- [Quick Start Deployment](./QUICK_START_DEPLOYMENT.md)

## Repository Structure

- `src/app`: App Router pages and route handlers
- `src/lib`: auth, org, audit, crypto, logging, and service helpers
- `src/components`: UI and feature components
- `prisma`: schema, migrations, and seed data
- `docs`: walkthroughs, contracts, and architecture planning notes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow, verification requirements, database-change guidance, PR expectations, and documentation rules.

## License

No license file is currently included in this repository. Until a license is added, reuse rights are not granted by default.
