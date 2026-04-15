# FreelanceHub - In-Depth System Documentation

## 1. Project Overview

### Purpose
FreelanceHub is a sophisticated, full-stack marketplace application engineered to connect clients with freelancers. It provides a complete end-to-end workflow covering user verification, project bidding, secure contract lifecycle administration, and milestone-based financial escrow processing via Stripe.

### Target Roles & Access Control
- **GUEST:** Can view public endpoints (Landing Page, Public Projects list, Public Freelancer profiles).
- **CLIENT:** Can post projects, review and manage bids, award contracts, fund milestones (via Stripe Checkout), and write reviews.
- **FREELANCER:** Can browse projects, submit/withdraw bids, submit work on milestones, link their Stripe Connect account for raw payouts, and write reviews.
- **ADMIN:** Headless role (with database table `admins` and endpoints) to suspend users, delete projects, and view platform statistics.

---

## 2. Comprehensive System Architecture

The application relies on a strictly decoupled **SPA (Single Page Application)** client layered over a robust **RESTful API backend layer**.

### 2.1 Backend (Spring Boot 4.0.3)
- Built on **Java 21** using standard MVC controller patterns (`@RestController`).
- Data access utilizes **Spring Data JPA** (Hibernate) directly layered over a **PostgreSQL 15+** dialect.
- JWT-based authentication via an intercepted `OncePerRequestFilter`. The JWT dictates the injected `Authentication` object holding granted `SimpleGrantedAuthority` (e.g., `ROLE_CLIENT`).

### 2.2 Frontend (Next.js 16.2.1)
- Utilizes the **App Router** paradigm (`app/` directory).
- Uses **React 19** server and client components selectively. Client components (`"use client"`) handle interactions (Hook Form, Zustand) while server components handle SEO layouts (`layout.tsx`).
- Network requests use `axios` configured with interceptors that silently attach `withCredentials: true` to forward HttpOnly session cookies.

---

## 3. Database Schema Mapping (PostgreSQL / Flyway)

The database is version-controlled via Flyway (`/db/migration`). Migrations track the specific timeline of changes up to `V16`.

### Core Tables
1. **users**: `id`, `email`, `password_hash`, `role` (CLIENT/FREELANCER), `name`, `profile_picture_url`, `status`, `created_at`.
2. **clients**: Specialized table (`user_id` foreign key), stores `company_name`, `bio`, `stripe_customer_id`.
3. **freelancers**: Specialized table (`user_id` foreign key), stores `bio`, `hourly_rate` (Double), `title`, `stripe_account_id` (Connect ID).
4. **freelancer_skills / project_skills**: Join tables linking standardized text skills to associated entities.
5. **email_verification_tokens / password_reset_tokens**: Store cryptographic strings with expiration timestamps matched to user IDs.
6. **projects**: `id`, `client_id`, `title`, `description`, `budget_min`, `budget_max`, `deadline`, `status` (OPEN, IN_PROGRESS, COMPLETED, CANCELLED). Now includes search vector columns (V16).
7. **bids**: `id`, `project_id`, `freelancer_id`, `proposal`, `amount`, `delivery_days`, `status` (PENDING, ACCEPTED, REJECTED, WITHDRAWN).
8. **contracts**: Created when a bid is ACCEPTED. `id`, `project_id`, `bid_id`, `client_id`, `freelancer_id`, `status`, `total_amount`.
9. **milestones**: `contract_id`, `amount`, `description`, `status` (PENDING, FUNDED, SUBMITTED, APPROVED, REJECTED), `stripe_payment_intent_id`.
10. **reviews**: Dual-directional (Client->Freelancer, Freelancer->Client) tying to `contract_id`. `rating` (1-5), `comment`.
11. **notifications**: In-app notifications triggering on state changes.
12. **stripe_event_log**: Tracks incoming webhook deduplication to guarantee idempotency.

---

## 4. Backend REST API Endpoints Details

All endpoints act under the `/api/v1` base route wrapper. Below is a categorized exhaustive list of the primary `@Controller` endpoints available.

### Authentication (`/auth`)
- `POST /register/client` & `POST /register/freelancer` - Initial setup flow.
- `POST /verify-email` & `POST /resend-verification` - Manages required email handshakes.
- `POST /login` - Issues `has_session` cookie and JWT.
- `POST /logout` - Flushes session headers.
- `POST /forgot-password` & `POST /reset-password` - Account recovery sequence.
- `GET /me` - Returns parsed JWT identity data.

### Users & Profiles (`/users`)
- `GET /users/me` - Profile metadata parsing.
- `GET /users/me/client-profile` & `GET /users/me/freelancer-profile`
- `PATCH /users/me/client-profile` / `PATCH /users/me/freelancer-profile`
- `PATCH /users/me/password`
- `GET /freelancers/{id}` - Public freelancer profile visibility.

### Projects (`/projects`)
- `GET /projects` - Public paginated feed mapped onto DB search vector capabilities.
- `GET /projects/{id}` - Full project metadata extraction.
- `GET /projects/my` / `POST /projects` / `PUT /projects/{id}` - Client-only routes to CRUD their portfolio.

### Bids (`/bids` & `/projects/{id}/bids`)
- `POST /projects/{id}/bids` - Freelancer proposal injection.
- `GET /projects/{id}/bids` - Client dashboard review panels.
- `GET /bids/my` - Freelancer history overview.
- `PUT /bids/{id}/withdraw` (Freelancer)
- `PUT /bids/{id}/accept` & `reject` (Client) - Accepting inherently bootstraps the Contract & Milestone services dynamically.

### Contracts & Milestones (`/contracts` & `/milestones`)
- `POST /contracts/{id}/milestones` - Add structural sub-tasks to existing contracts.
- `GET /contracts/{id}/milestones` - List chronological task dependencies.
- `PUT /milestones/{id}/submit` - Freelancer submitting evidence.
- `PUT /milestones/{id}/approve` & `revision` - Client validation logic.

### Payments (`/stripe`)
- `POST /milestones/{id}/fund` - Invokes Stripe Java SDK to build a `PaymentIntent` tying the milestone object to actual fiat currency. Returns Client Secret.
- `POST /milestones/{id}/refund` - Client-side abort logic.
- `POST /stripe/connect/onboard` - Yields an Express Connect URL for freelancers to perform KYC.
- `GET /stripe/connect/status` - Sync back Stripe verification checks.
- `POST /webhook` - Consumes real-time asymmetric `application/json` webhook payloads from Stripe to unlock milestone states without trusting client network conditions.

### Feedback & Notification System
- `POST /contracts/{id}/reviews` - Rating submissions mapping.
- `GET /clients/{id}/reviews` / `GET /freelancers/{id}/reviews`
- `GET /notifications` (and `unread-count`)
- `PATCH /notifications/{id}/read` & `/read-all`

### Admin Endpoints (`/admin`)
- `GET /users` - Administrator user audit.
- `PUT /users/{id}/suspend` & `activate` - Toggles the `status` block inside the authentication filter.
- `DELETE /projects/{id}` - Hard removals mapping.
- `GET /stats` - Aggregated financial metrics summary.

---

## 5. Frontend Deep Dive (Next.js & Module System)

### React Zustand Store Architectures
- **`useAuthStore`** encapsulates session logic directly:
  - Tracks: `userId`, `email`, `role`, `name`, `isAuthenticated`.
  - Actions: `login(AuthResponse payload)` injecting local state. `logout()` which forcibly clears browser cookie strings: `has_session`, `user_role`, `email_verified`, `XSRF-TOKEN` and sets `INITIAL_STATE`.

### Reusable UI Components library
Found in `modules/shared/components/`:
- **Containers**: `card`, `alert-dialog`, `empty-state`, `dropdown-menu`, `skeleton`.
- **Primitives**: `button`, `input`, `select`, `label`, `separator`, `pagination`.
- **Visual Feedback**: `badge`, `status-badge`, `skill-tag`, `stat-card`.
- UI constructs strictly wrap raw `shadcn/ui` components while feeding variables mapped via `clsx` and `tailwind-merge` preventing class collision overlaps. 

### API Calling Protocol (Hooks Layer)
Every feature constructs granular React Query hooks:
- API layer fetches return unwrapped promises payload instances (using destructured `{ data }` from axios instances).
- Object Key factories (e.g. `const resourceKeys = { list: ["bids"], details: (id) => ["bid", id] }`) define nested hierarchical cache keys.
- **Mutations** enforce `queryClient.invalidateQueries(resourceKeys.list())` upon successful callbacks to automatically sweep stale lists from the UI gracefully without hard reloads.

### Forms and Validation Standards
**React Hook Form** wraps input bounds heavily.
- Every external submit relies on `zod` for `standardSchemaResolver` translations.
- Cross-validation explicitly requires chained `.refine()` paths rendering validation messages beneath specific fields (e.g., ensuring `budget_min` <= `budget_max`).
- Buttons tie directly to `isSubmitting` bounds via native HTML `disabled` flags.

---

## 6. Security Context & Mitigation Strategies

- **Password Integrity:** `BCryptPasswordEncoder` ensures hashing at rest.
- **Identity Spoofery Protection:** Axios clients hold generic configuration prohibiting hard-coded token insertion, relying strictly upon generic `withCredentials` transmission of backend HttpOnly locked cookies.
- **Role Boundary Fences:** Endpoint levels leverage specific annotations `@PreAuthorize("hasRole('CLIENT')")` ensuring a User mimicking dashboard paths via local-storage spoofing physically encounters `403 FORBIDDEN` rejections instantly.

---

## 7. Performance & Edge Case Fallbacks

- **N+1 Entity Loads Layer:** Strictly mapped LAZY entity relations inside JPA Models.
- **SQL Profiling:** `hibernate.format_sql` and `show-sql` true settings within `application.yml` provide query visualization sequences locally.
- **Deadlock Mitigations:** Asynchronous operations tied to Stripe Connect or Mail delivery directly map out to decoupled service handlers. Webhooks leverage the `stripe_event_log` table storing raw event IDs instantly before proceeding, enforcing idempotency across massive spike conditions.

---

## 8. Run State

**1. Configuration**
A basic local setup mandates `SPRING_PROFILES_ACTIVE=dev` implicitly defaulting to postgres over localhost parsing the standard developer password configurations outlined in `/backend/src/main/resources/application.yml`. 

**2. Node Dev Execution**
The frontend utilizes `pnpm` workspace optimizations. Executing `pnpm dev:all` utilizes the `concurrently` package stringing both the Next.js memory stack alongside executing `cd ../backend && ./mvnw spring-boot:run`, eliminating manual terminal spanning.
