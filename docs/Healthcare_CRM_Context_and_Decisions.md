# Healthcare CRM - Context & Architecture Decisions

## Vision
Build a highly scalable, secure, and auditable Healthcare CRM that serves individual clinics to large multi-specialty hospital networks. It must offer a premium, industry-standard UI/UX that delights both medical professionals and patients, prioritizing speed, reliability, and ease of use.

## Architecture Decisions
- **Frontend / Fullstack Framework:** Next.js (App Router) for Server-Side Rendering (SSR) and seamless API integration.
- **Styling & UI:** Tailwind CSS combined with shadcn/ui for accessible, bespoke, and performant UI components. Framer motion for dynamic animations.
- **Backend Architecture:** Monorepo structure, Node.js/TypeScript decoupled or integrated via Next.js API routes.
- **Database:** PostgreSQL for relational integrity, complex queries, and transactional safety. Prisma ORM or Drizzle ORM for type-safe database queries.
- **Background Jobs & Queuing:** Redis + BullMQ for handling asynchronous tasks like email/SMS reminders, report generation, and third-party webhooks.
- **Authentication & Security:** JWT/OAuth-based authentication (e.g., NextAuth.js or Clerk), multi-tenant data isolation via `orgId`.

## Core Principles
- **Industry-Standard Design:** The system must not feel like legacy medical software. It should be as intuitive and aesthetically pleasing as modern consumer SaaS. Built with robust generic components like Shadcn/ui.
- **Comprehensive Scenarios:** The architecture must be extensible to support telehealth, diverse billing structures, dynamic clinical forms, and hardware integrations (like barcode scanners or DICOM).
- **Privacy by Design:** Strict adherence to HIPAA/GDPR. All PHI (Protected Health Information) must be encrypted.
- **Audit Everything:** Append-only audit logging for every single write, update, or delete operation.
