# Healthcare CRM - Data Model Overview
*(Designed for PostgreSQL + Prisma / Drizzle)*

## Multi-Tenant & RBAC
- `organizations`: Clinics, hospital branches.
- `users`: Staff, doctors, admins, patients (portal access).
- `roles`, `permissions`, `user_roles`: Fine-grained access control.

## CRM Core (Patient & Clinical)
- `patients`: Demographics, emergency contacts, medical history.
- `appointments`: Schedules, resource allocation (rooms/doctors), statuses (scheduled, arrived, no-show, completed).
- `encounters`: Actual visits.
- `encounter_notes`: Extensible JSON or structured SOAP note formats.
- `vitals`: Height, weight, BP, HR, BMI, SpO2, etc.
- `prescriptions` & `medications`: Issued Rx tied to encounters.
- `lab_results`: Integrated lab/test outcomes.

## Operations & Billing
- `invoices`, `invoice_line_items`: Billing records and respective details.
- `payments`: Transactions, payment methods (Credit Card, Cash, Insurance).
- `insurance_claims`: Primary/secondary insurance, claim statuses, pre-authorizations.
- `inventory`, `inventory_transactions`: Consumables, devices, and pharmacy tracking.

## Communication & Engagement
- `tasks`: Internal staff to-dos.
- `communications`: Logs of SMS/emails/WhatsApp sent, patient replies.
- `campaigns`: Marketing, patient onboarding scripts, or bulk health-reminder campaigns.

## Governance & Compliance
- `audit_logs`: (Append-only) Action, userId, resource, before/after state.
- `consents`: Patient signatures (HIPAA forms, treatment consent, data usage).
- `documents`: Secure S3/GCS keys for scanned IDs, medical imaging, past health records.

## Extended Features (Future-Proofing)
- `telehealth_sessions`: Video links, durations, recordings (if legally compliant).
- `ai_insights`: Pre-computed LLM/AI summaries of patient history, diagnosis probability flags.
