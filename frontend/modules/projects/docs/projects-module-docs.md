# Projects Module — Documentation

## Overview

The **Projects** module is a self-contained feature slice responsible for browsing, filtering, viewing, and bidding on freelance projects. It follows a strict layered architecture: API service → React Query hooks → UI components.

---

## Directory Structure

```
features/projects/
├── api/
│   ├── projects.service.ts     # HTTP calls for project resources
│   └── bids.service.ts         # HTTP calls for bid resources
├── components/
│   ├── ProjectListPanel.tsx    # Left panel: filter + paginated list
│   ├── ProjectListItem.tsx     # Single row in the list
│   ├── ProjectDetailPanel.tsx  # Right panel: full project detail
│   ├── ProjectCard.tsx         # Card variant used on landing/home
│   ├── ProjectFilters.tsx      # Search + advanced filter controls
│   ├── BidForm.tsx             # Freelancer bid submission form
│   └── Pagination.tsx          # Generic pagination control
├── hooks/
│   ├── useProject.ts           # Queries: project list + single project
│   └── useBid.ts               # Queries + mutations: bids
├── schemas/
│   ├── create-project.schema.ts
│   └── create.bid.schema.ts
├── types.ts                    # Bid domain types (BidStatus, BidRequest, etc.)
└── index.ts                    # Public API — barrel exports
```

---

## Architecture

### Layering Rules

```
UI Components
     ↓ consume
React Query Hooks
     ↓ call
API Services
     ↓ use
axios instance (shared, from @/lib/axios)
```

- Components **never** call API services directly.
- API services **never** import hooks.
- Types flow **upward only** — services return typed responses; hooks and components consume them.

---

## API Services

### `api/projects.service.ts`

#### `getProjects(filters: ProjectFilters): Promise<PaginatedResponse<ProjectSummaryResponse>>`

Fetches a paginated, filtered list of projects.

**Parameters** (all optional except `page`/`size`):

| Field | Type | Description |
|---|---|---|
| `page` | `number` | 0-based page index |
| `size` | `number` | Items per page (default: 10) |
| `category` | `ProjectCategory` | Filter by category: `WEB`, `MOBILE`, `AI` |
| `status` | `ProjectStatus` | Filter by project status |
| `budgetMin` | `number` | Minimum budget filter |
| `budgetMax` | `number` | Maximum budget filter |
| `search` | `string` | Full-text search |
| `skill` | `string` | Skill-specific search |

**Returns:** `PaginatedResponse<ProjectSummaryResponse>` — includes `content[]`, `totalElements`, `totalPages`.

---

#### `getProject(id: string): Promise<ProjectResponse>`

Fetches the full detail of a single project.

**Throws:** 404 if project not found.

---

### `api/bids.service.ts`

#### `getMyBid(projectId: string): Promise<BidResponse | null>`

Fetches the authenticated user's bid on a specific project by scanning `/bids/my` (up to 50 bids). Returns `null` if no match is found or a 404 is returned.

> ⚠️ **Limitation:** Only searches the first 50 bids. Users with more than 50 bids may experience a miss.

---

#### `submitBid(projectId, payload: BidRequest): Promise<BidResponse>`

Submits a new bid on a project. Only callable by authenticated freelancers.

**Payload:**

| Field | Type | Constraints |
|---|---|---|
| `proposedPrice` | `number` | Positive, max 1,000,000 |
| `estimatedDays` | `number` | Integer, 1–365 |
| `coverLetter` | `string` | 50–3000 characters |

---

#### `withdrawBid(bidId: string): Promise<BidResponse>`

Withdraws an existing bid. Returns the updated bid with `status: "WITHDRAWN"`.

---

## React Query Hooks

### `hooks/useProject.ts`

#### Query Keys

```ts
projectKeys.list(filters)   // ["projects", filters]
projectKeys.detail(id)      // ["project", id]
```

#### `useProjects(filters: ProjectFilters)`

Fetches paginated project list. Uses `placeholderData` to keep the previous page visible while new data loads (prevents flash on filter/page change).

#### `useProject(id: string)`

Fetches a single project. **Disabled** when `id` is falsy.

---

### `hooks/useBid.ts`

#### Query Keys

```ts
bidKeys.myBid(projectId)   // ["projects", projectId, "bids", "my"]
bidKeys.all(projectId)     // ["projects", projectId, "bids"]
```

#### `useMyBid(projectId, enabled?)`

Fetches the current user's bid. **Disabled** when:
- User is not authenticated (`isAuthenticated === false` from auth store)
- `enabled` prop is explicitly `false`
- `projectId` is falsy

`staleTime: 60_000` — avoids redundant re-fetches during normal browsing.

#### `useSubmitBid(projectId)`

Mutation to submit a bid. On success, invalidates:
- `bidKeys.myBid(projectId)` — refresh the user's bid
- `bidKeys.all(projectId)` — refresh full bid list
- `["project", projectId]` — refresh project detail (bid count updates)

#### `useWithdrawBid(projectId)`

Mutation to withdraw a bid. On success, invalidates the same three query keys as `useSubmitBid`.

---

## Components

### `<ProjectListPanel selectedId onSelect />`

The left panel of the split-view layout. Owns all filter and pagination state internally. Communicates upward only through `onSelect(id)`.

**State owned:**

| State | Type | Initial |
|---|---|---|
| `search` | `string` | `""` |
| `category` | `ProjectCategory \| ""` | `""` |
| `status` | `ProjectStatus \| ""` | `""` |
| `budgetMin` | `string` | `""` |
| `budgetMax` | `string` | `""` |
| `page` | `number` | `0` |

**Behavior:**
- Auto-selects the first project on initial load if nothing is selected.
- Resets `page` to `0` on any filter change.
- `filters` object is memoized with `useMemo` to avoid unnecessary re-queries.

---

### `<ProjectListItem project isSelected onSelect />`

A single button row in the project list. Visually indicates selection with a left border accent and primary text color. Exposes `aria-pressed` for accessibility.

---

### `<ProjectFilter />`

Search bar + collapsible advanced filters panel. Displays active filter chips with individual remove buttons. Shows a count badge on the Filters button when filters are active.

---

### `<BidForm projectId onSuccess? />`

Controlled form using `react-hook-form` with `standardSchemaResolver` (Zod v4 compatible). Displays a persistent `Alert` banner on server-side mutation errors. Calls `onSuccess?.()` after a successful submit so the parent can close or reset the panel.

---

### `<Pagination page totalPages setPage />`

Stateless pagination control. Generates ellipsis-aware page number arrays. All page indices are **0-based** internally; displayed as **1-based** to the user.

---

### `<ProjectCard project />`

Card variant for grid layouts (e.g. homepage). Links directly to `/projects/:id`. Shows up to 4 skill tags with overflow indicator.

---

## Schemas

### `createProjectSchema`

| Field | Rules |
|---|---|
| `title` | 10–100 chars |
| `description` | 50–5000 chars |
| `category` | `WEB \| MOBILE \| AI` |
| `budgetMin` | Positive number, max 1,000,000 |
| `budgetMax` | Positive number, max 1,000,000, must be ≥ `budgetMin` (cross-field refinement) |
| `deadline` | Valid future date string |
| `requiredSkills` | Array of 1–10 strings |

### `bidSchema`

| Field | Rules |
|---|---|
| `proposedPrice` | Positive number, max 1,000,000 |
| `estimatedDays` | Integer, 1–365 |
| `coverLetter` | 50–3000 chars |

---

## Types (`types.ts`)

```ts
type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"

interface BidRequest {
  proposedPrice: number
  estimatedDays: number
  coverLetter: string
}

interface UpdateBidStatusRequest {
  status: "ACCEPTED" | "REJECTED"
}
```

Global shared types (`ProjectResponse`, `ProjectSummaryResponse`, `PaginatedResponse`, `ProjectFilters`, `ProjectCategory`, `ProjectStatus`) are defined in `@/types`.

---

## Public API (`index.ts`)

Everything exported from `index.ts` is the module's public surface. Internal implementation details (e.g. `bidKeys`, `projectKeys`) are not exported unless consumed by other modules.

```ts
// Hooks
export { useProjects, useProject } from "./hooks/useProject"
export { useMyBid, useSubmitBid, useWithdrawBid } from "./hooks/useBid"

// Components
export { ProjectListPanel } from "./components/ProjectListPanel"
export { ProjectDetailPanel } from "./components/ProjectDetailPanel"
export { ProjectCard } from "./components/ProjectCard"
export { BidForm } from "./components/BidForm"

// Schemas & types
export { createProjectSchema } from "./schemas/create-project.schema"
export type { CreateProjectFormValues } from "./schemas/create-project.schema"
export { bidSchema } from "./schemas/create.bid.schema"
export type { BidFormValues } from "./schemas/create.bid.schema"
export type { BidStatus, BidRequest, UpdateBidStatusRequest } from "./types"
```

---

## Data Flow Diagram

```
User interacts with ProjectListPanel
        │
        ├─ filter/page change
        │       └─ useProjects(filters) ──► GET /projects?...
        │
        └─ clicks project row
                └─ onSelect(id) ──► ProjectDetailPanel
                        │
                        ├─ useProject(id) ──► GET /projects/:id
                        └─ useMyBid(id)   ──► GET /bids/my
                                │
                                ├─ no bid ──► BidForm
                                │               └─ useSubmitBid ──► POST /projects/:id/bids
                                │                       └─ onSuccess: invalidate queries
                                │
                                └─ has bid ──► show bid + withdraw button
                                                └─ useWithdrawBid ──► PUT /bids/:id/withdraw
                                                        └─ onSuccess: invalidate queries
```