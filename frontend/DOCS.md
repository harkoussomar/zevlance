# FreelanceHub — Frontend Documentation

> A modern freelance marketplace platform built with Next.js, connecting ddients with freelancers through project posting, bidding, contracts, and payments.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Components** | Radix UI + shadcn/ui |
| **State Management** | Zustand (auth), React Query (server state) |
| **Forms** | React Hook Form + Zod validation |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Theme** | next-themes (dark/light/system) |
| **Linting** | ESLint + eslint-config-next |

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (not behind auth wall)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Authenticated dashboard routes
│   │   ├── layout.tsx            # Dashboard shell (Sidebar + Topbar)
│   │   ├── client/               # Client-specific pages
│   │   │   ├── page.tsx          # Client dashboard home
│   │   │   ├── profile/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx      # List client's projects
│   │   │   │   ├── create/       # Create new project
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Project detail
│   │   │   │       └── edit/     # Edit project
│   │   │   └── contracts/
│   │   │       ├── page.tsx      # List client contracts
│   │   │       └── [id]/page.tsx # Contract detail
│   │   ├── freelancer/           # Freelancer-specific pages
│   │   │   ├── page.tsx          # Freelancer dashboard home
│   │   │   ├── profile/page.tsx
│   │   │   ├── bids/page.tsx     # Freelancer's submitted bids
│   │   │   └── contracts/
│   │   │       ├── page.tsx      # List freelancer contracts
│   │   │       └── [id]/page.tsx # Contract detail
│   │   └── settings/page.tsx     # User settings (shared)
│   ├── (public)/                 # Public-facing routes
│   │   ├── freelancers/[id]/page.tsx  # Public freelancer profile
│   │   └── projects/page.tsx          # Browse public projects
│   ├── layout.tsx                # Root layout (providers, fonts, theme)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   └── favicon.ico
├── modules/                      # Feature-based modular architecture
│   ├── auth/                     # Authentication
│   │   ├── hooks/                # useLogin, useLogout
│   │   ├── services/             # Auth API service
│   │   ├── schemas/              # Login/register Zod schemas
│   │   ├── types.ts
│   │   └── index.ts
│   ├── bid/                      # Bidding system
│   │   ├── components/           # FreelancerBidForm, FreelancerBidCard, ClientBidCard, FreelancerBidsPanel, ClientProjectBidsPanel
│   │   ├── config/               # Status, tabs, stat configurations
│   │   ├── schemas/              # submit-bid.schema.ts
│   │   ├── services/             # freelancer.bid.service, client.bid.service
│   │   ├── types.ts
│   │   └── index.ts
│   ├── contracts/                # Contract management
│   │   ├── services/             # contract.service.ts
│   │   └── types.ts
│   ├── dashboard/                # Dashboard-specific logic
│   ├── landing-page/             # Public landing page
│   │   └── components/           # Navbar, HeroSection, StatsSection, FeaturesSection, HowItWorksSection, RoleCardsSection, TestimonialsSection, CTASection, Footer
│   ├── milestone/                # Project milestones
│   ├── navigation/               # App navigation shell
│   │   ├── components/           # Sidebar, MobileSidebar, Topbar
│   │   ├── config/               # Navigation config
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── payment/                  # Payment processing
│   │   ├── hooks/                # usePayment
│   │   ├── services/             # payment.service.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── profile/                  # User profiles
│   │   ├── components/           # ProfileHero, ProfileStatCard, ProfileReviewsSection, ProfileReviewCard, ClientProfilePage, FreelancerProfilePage
│   │   ├── hooks/                # useProfile
│   │   ├── services/             # profile.service (client), profile.server (server)
│   │   ├── types.ts
│   │   └── index.ts
│   ├── projects/                 # Project management
│   │   ├── components/           # ProjectCard, ProjectDetailPanel, ClientProjectForm
│   │   ├── hooks/                # useProject
│   │   ├── schemas/              # create.project.schema.ts
│   │   ├── services/             # projects.service.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── review/                   # Review/rating system
│   ├── settings/                 # User settings
│   │   ├── components/           # SettingsPage, ClientSettingsForm, FreelancerSettingsForm, ChangePasswordForm, StripeConnectSection
│   │   ├── hooks/                # useSettings
│   │   ├── services/             # settings.service.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── shared/                   # Shared utilities & components
│       ├── components/           # Reusable UI: button, input, select, card, badge, alert, skeleton, empty-state, status-badge, tag, skill-tag, label, separator, section-label, form-field, pagination, alert-dialog, dropdown-menu, stat-card, theme-toggle
│       ├── config/               # status.config.ts
│       ├── lib/                  # axios.ts (HTTP client setup), server-fetch.ts
│       ├── providers/            # AuthProvider, ReactQueryProvider, ThemeProvider
│       ├── utils/                # classnames, currency, date, options, parse-api-error, percentage, role-redirection
│       ├── types/                # Shared TypeScript types
│       └── index.ts
├── store/                        # Global state stores
│   └── auth-store.ts             # Zustand auth store
├── public/                       # Static assets
├── proxy.ts                      # Next.js middleware (auth redirects)
├── next.config.ts                # Next.js configuration
├── tsconfig.json
├── components.json               # shadcn/ui configuration
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

---

## Architecture

### Module-Based Feature Organization

The app follows a **feature-module architecture** where each business domain (auth, bids, projects, contracts, etc.) is self-contained with its own:

- **components/** — React UI components
- **services/** — API service layer (Axios calls)
- **hooks/** — Custom React hooks (React Query wrappers)
- **schemas/** — Zod validation schemas
- **types.ts** — TypeScript type definitions
- **index.ts** — Public barrel exports

### State Management

| Layer | Tool | Purpose |
|---|---|---|
| Auth session | Zustand (`store/auth-store.ts`) | Stores user identity, role, auth status |
| Server data | React Query (`@tanstack/react-query`) | Cached API responses, mutations |
| Form state | React Hook Form | Controlled form inputs + validation |

### Authentication Flow

1. **Middleware** (`proxy.ts`) checks for `has_session` cookie and redirects unauthenticated users to `/login`
2. **AuthProvider** wraps the app, reading the session cookie server-side in `layout.tsx`
3. **Zustand store** holds user data (`userId`, `email`, `role`, `name`) in memory
4. **Axios interceptor** attaches JWT cookies to requests and handles 401 responses
5. **Role-based routing** redirects clients and freelancers to their respective dashboards

### Role-Based Access

The platform supports two user roles:

- **CLIENT** — Posts projects, reviews bids, manages contracts, makes payments
- **FREELANCER** — Browses projects, submits bids, manages contracts, receives payments

Dashboard routes are separated under `/client/*` and `/freelancer/*` with a shared `/settings` page.

---

## Routes

### Public Routes

| Route | Description |
|---|---|
| `/` | Landing page (hero, features, testimonials, CTA) |
| `/projects` | Browse all public projects |
| `/freelancers/[id]` | Public freelancer profile view |

### Auth Routes

| Route | Description |
|---|---|
| `/login` | User login form |
| `/register` | User registration form |

### Client Dashboard Routes

| Route | Description |
|---|---|
| `/client` | Client dashboard home |
| `/client/projects` | List all client's projects |
| `/client/projects/create` | Create a new project |
| `/client/projects/[id]` | Project detail with bids panel |
| `/client/projects/[id]/edit` | Edit an existing project |
| `/client/contracts` | List all client contracts |
| `/client/contracts/[id]` | Contract detail view |
| `/client/profile` | Client profile page |

### Freelancer Dashboard Routes

| Route | Description |
|---|---|
| `/freelancer` | Freelancer dashboard home |
| `/freelancer/bids` | Freelancer's submitted bids |
| `/freelancer/contracts` | List freelancer contracts |
| `/freelancer/contracts/[id]` | Contract detail view |
| `/freelancer/profile` | Freelancer profile page |

### Shared Routes

| Route | Description |
|---|---|
| `/settings` | User settings (profile, password, Stripe Connect) |

---

## Key Modules

### Bidding System (`modules/bid/`)

- Freelancers can submit bids with proposals and pricing
- Clients can view, accept, or reject bids on their projects
- Bid statuses are configured in `config/status-config.ts`
- Separate service layers for client and freelancer bid operations

### Projects (`modules/projects/`)

- Clients create and manage projects with details, budgets, and skills
- Projects are displayed as cards with status badges
- Server-side fetching available via `server-fetch.ts` for SEO

### Contracts (`modules/contracts/`)

- Contracts are formed from accepted bids
- Both clients and freelancers can view contract details
- Service layer handles contract lifecycle operations

### Payments (`modules/payment/`)

- Stripe Connect integration for escrow-style payments
- `usePayment` hook for payment actions
- Settings page includes Stripe Connect onboarding section

### Settings (`modules/settings/`)

- Role-specific settings forms (ClientSettingsForm / FreelancerSettingsForm)
- Change password functionality
- Stripe Connect account linking

---

## Development

### Prerequisites

- Node.js 20+
- pnpm (package manager)
- Backend API running (Spring Boot, see `dev:api` script)

### Scripts

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm dev:api          # Start backend (Spring Boot via Maven)
pnpm dev:all          # Run both frontend and backend concurrently
```

### Environment Variables

See `.env` file for required environment variables (API URL, etc.).

---

## UI System

### Design Tokens

- **Fonts**: Bricolage Grotesque (display), DM Sans (body), DM Mono (code)
- **Theme**: Dark/light mode via `next-themes`, system default
- **Components**: shadcn/ui built on Radix UI primitives, styled with Tailwind CSS

### Shared Components

Located in `modules/shared/components/`:

- `button`, `input`, `select` — Form primitives
- `card`, `badge`, `tag`, `skill-tag`, `label` — Display primitives
- `alert`, `alert-dialog` — Feedback and confirmations
- `skeleton`, `empty-state` — Loading and empty states
- `status-badge` — Colored status indicators
- `stat-card` — Dashboard metric cards
- `pagination` — List pagination
- `section-label`, `separator`, `form-field` — Layout helpers
- `dropdown-menu` — Context menus
- `theme-toggle` — Dark/light mode switcher

---

## API Integration

- **Base client**: `modules/shared/lib/axios.ts` — Configured Axios instance with auth interceptors
- **Server fetching**: `modules/shared/lib/server-fetch.ts` — For server components (SSR)
- Each module's `services/` directory contains typed API call functions
- React Query hooks wrap service calls for caching and invalidation
