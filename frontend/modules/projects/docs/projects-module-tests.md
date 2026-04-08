# Projects Module — Test Scenarios & Edge Cases

## Overview

This document covers all test scenarios for the **Projects** feature module, including unit tests, integration tests, and edge cases across every layer: API services, React Query hooks, and UI components.

---

## 1. API Service Layer (`api/projects.service.ts`, `api/bids.service.ts`)

### `getProjects(filters)`

| # | Scenario | Input | Expected |
|---|---|---|---|
| 1.1 | Fetches with no filters | `{}` | Returns paginated list with default page/size |
| 1.2 | Fetches with all filters | `{ page:1, size:5, category:"WEB", status:"OPEN", budgetMin:500, budgetMax:5000, search:"react", skill:"react" }` | Passes all params to axios correctly |
| 1.3 | Server returns empty list | — | Returns `{ content: [], totalElements: 0, totalPages: 0 }` |
| 1.4 | Server returns 500 | — | Throws error, propagates to caller |
| 1.5 | Server returns 401 | — | Throws error (axios interceptor handles redirect) |
| 1.6 | Network timeout | — | Throws network error |

### `getProject(id)`

| # | Scenario | Input | Expected |
|---|---|---|---|
| 2.1 | Valid project ID | `"abc-123"` | Returns full `ProjectResponse` |
| 2.2 | Non-existent ID | `"not-found"` | Throws 404 error |
| 2.3 | Malformed ID | `""` | Should not call API (disabled at hook level) |

### `getMyBid(projectId)`

| # | Scenario | Input | Expected |
|---|---|---|---|
| 3.1 | User has a bid on this project | `"proj-1"` | Returns matching `BidResponse` |
| 3.2 | User has bids but not on this project | `"proj-999"` | Returns `null` |
| 3.3 | User has no bids at all | `"proj-1"` | Returns `null` |
| 3.4 | API returns 404 | — | Returns `null` (caught internally) |
| 3.5 | API returns 500 | — | Re-throws error |
| 3.6 | Paginated response has more than 50 bids | — | Only searches within first 50 — **edge case: bid may be missed** |

### `submitBid(projectId, payload)`

| # | Scenario | Input | Expected |
|---|---|---|---|
| 4.1 | Valid payload | `{ proposedPrice: 1200, estimatedDays: 14, coverLetter: "50+ chars..." }` | Returns created `BidResponse` |
| 4.2 | Server validation fails | Price = 0 | Throws 400 error |
| 4.3 | Already has a bid | — | Server throws 409 conflict |
| 4.4 | Unauthenticated | — | Server throws 401 |

### `withdrawBid(bidId)`

| # | Scenario | Input | Expected |
|---|---|---|---|
| 5.1 | Valid bid ID | `"bid-123"` | Returns `BidResponse` with `status: "WITHDRAWN"` |
| 5.2 | Already withdrawn bid | — | Server throws 409 or 400 |
| 5.3 | Bid belongs to another user | — | Server throws 403 |

---

## 2. React Query Hooks

### `useProjects(filters)`

| # | Scenario | Expected |
|---|---|---|
| 6.1 | Initial load | `isLoading: true`, data undefined |
| 6.2 | Successful fetch | `isLoading: false`, data populated |
| 6.3 | Filter changes | New query fires, `placeholderData` keeps old list visible |
| 6.4 | Same filters, within staleTime | No re-fetch (cache hit) |
| 6.5 | Window refocus | Re-fetches if data is stale |
| 6.6 | Fetch error | `isError: true`, `error` populated |

### `useProject(id)`

| # | Scenario | Expected |
|---|---|---|
| 7.1 | `id` is empty string | Query is disabled, no fetch |
| 7.2 | Valid `id` | Fetches and returns project detail |
| 7.3 | `id` changes | New fetch for new ID |
| 7.4 | Not found | `isError: true` with 404 |

### `useMyBid(projectId, enabled)`

| # | Scenario | Expected |
|---|---|---|
| 8.1 | User not authenticated | Query disabled, no fetch |
| 8.2 | `enabled = false` explicitly | Query disabled |
| 8.3 | User authenticated, has bid | Returns bid data |
| 8.4 | User authenticated, no bid | Returns `null`, `isError: false` |
| 8.5 | Cache hit within 60s | No re-fetch |

### `useSubmitBid(projectId)`

| # | Scenario | Expected |
|---|---|---|
| 9.1 | Successful submission | Invalidates `myBid`, `all bids`, and `project` queries |
| 9.2 | Failed submission | `isError: true`, no cache invalidation |
| 9.3 | Called while already submitting | Second call should be blocked at UI level |

### `useWithdrawBid(projectId)`

| # | Scenario | Expected |
|---|---|---|
| 10.1 | Successful withdrawal | Invalidates `myBid`, `all bids`, and `project` queries |
| 10.2 | Failed withdrawal | `isError: true`, cache unchanged |

---

## 3. Component Tests

### `<ProjectListPanel />`

| # | Scenario | Expected |
|---|---|---|
| 11.1 | Initial render, loading | Shows skeleton placeholder (6 rows) |
| 11.2 | Projects loaded | Renders list of `ProjectListItem` |
| 11.3 | Empty result | Shows `EmptyState` with "No projects found" |
| 11.4 | Error state | Shows error message + "Reset & retry" button |
| 11.5 | Auto-selects first project | On load with no `selectedId`, calls `onSelect(projects[0].id)` |
| 11.6 | Does not auto-select if already selected | `onSelect` not called again |
| 11.7 | Search input change | `setSearch` updates, `page` resets to 0 |
| 11.8 | Filter change | `page` resets to 0 |
| 11.9 | Clear all filters | All filter state resets to defaults |
| 11.10 | `totalPages <= 1` | Pagination not rendered |
| 11.11 | `totalPages > 1` | Pagination rendered |

### `<ProjectListItem />`

| # | Scenario | Expected |
|---|---|---|
| 12.1 | Selected item | Has `border-l-primary`, title is `text-primary` |
| 12.2 | Unselected item | Has `border-l-transparent` |
| 12.3 | Click item | Calls `onSelect(project.id)` |
| 12.4 | More than 3 skills | Shows "+N" overflow indicator |
| 12.5 | No skills | Renders without crashing |
| 12.6 | `aria-pressed` attribute | Reflects `isSelected` value |

### `<ProjectFilter />`

| # | Scenario | Expected |
|---|---|---|
| 13.1 | Filters hidden by default | Filter panel not in DOM |
| 13.2 | Click "Filters" button | Panel appears |
| 13.3 | No active filters | Badge not shown on Filters button |
| 13.4 | 2 active filters | Badge shows "2" |
| 13.5 | Remove individual chip | Only that filter cleared |
| 13.6 | "Clear all" | All filters cleared |
| 13.7 | Budget chip shows range | "Budget: 500 – 5000" format |
| 13.8 | Budget chip only min set | "Budget: 500 – ∞" |

### `<BidForm />`

| # | Scenario | Expected |
|---|---|---|
| 14.1 | Submit empty form | Shows validation errors on all fields |
| 14.2 | Cover letter < 50 chars | Shows min length error |
| 14.3 | Cover letter > 3000 chars | Shows max length error |
| 14.4 | Price = 0 or negative | Shows error |
| 14.5 | Days < 1 | Shows error |
| 14.6 | Days > 365 | Shows error |
| 14.7 | Valid submit | Calls `submitBid.mutateAsync`, then `onSuccess?.()` |
| 14.8 | Server error on submit | Shows `Alert` banner with error message |
| 14.9 | Loading state | Button shows spinner, is disabled |
| 14.10 | Character counter | Updates live as user types in cover letter |

### `<Pagination />`

| # | Scenario | Expected |
|---|---|---|
| 15.1 | First page | "Prev" button disabled |
| 15.2 | Last page | "Next" button disabled |
| 15.3 | Click page number | `setPage` called with correct 0-based index |
| 15.4 | Current page highlighted | Has `bg-primary` class |
| 15.5 | ≤ 7 pages | All pages shown, no ellipsis |
| 15.6 | > 7 pages, near start | Ellipsis after page 3 |
| 15.7 | > 7 pages, near end | Ellipsis before last 3 |
| 15.8 | Middle of many pages | Ellipsis on both sides |

### `<ProjectCard />`

| # | Scenario | Expected |
|---|---|---|
| 16.1 | Renders project data | Title, budget, skills, bid count visible |
| 16.2 | More than 4 skills | "+N" overflow shown |
| 16.3 | Click card | Navigates to `/projects/:id` |
| 16.4 | Hover state | Card lifts, border changes to primary |

---

## 4. Schema Validation (`create-project.schema.ts`, `create.bid.schema.ts`)

### `createProjectSchema`

| # | Scenario | Expected |
|---|---|---|
| 17.1 | Title < 10 chars | Fails with min length message |
| 17.2 | Title > 100 chars | Fails with max length message |
| 17.3 | Description < 50 chars | Fails |
| 17.4 | Invalid category | Fails with enum error |
| 17.5 | `budgetMax < budgetMin` | Fails with refinement error on `budgetMax` |
| 17.6 | Past deadline | Fails refinement |
| 17.7 | Invalid date string | Fails refinement |
| 17.8 | 0 skills | Fails min array |
| 17.9 | 11 skills | Fails max array |
| 17.10 | All valid data | Passes and infers correct types |

### `bidSchema`

| # | Scenario | Expected |
|---|---|---|
| 18.1 | Price = 0 | Fails `.positive()` |
| 18.2 | Price > 1,000,000 | Fails `.max()` |
| 18.3 | Days = 0 | Fails `.min(1)` |
| 18.4 | Days = 366 | Fails `.max(365)` |
| 18.5 | Days = 1.5 (float) | Fails `.int()` |
| 18.6 | Cover letter = 49 chars | Fails `.min(50)` |
| 18.7 | All valid | Passes |

---

## 5. Integration / Flow Tests

| # | Flow | Steps | Expected |
|---|---|---|---|
| 19.1 | Full browse & select | Load page → list renders → click item → detail panel updates | Selected item highlighted, detail loaded |
| 19.2 | Search flow | Type in search → debounce → new query fires → list updates | Results match search term |
| 19.3 | Submit bid flow | Open bid form → fill valid data → submit → success | `myBid` query invalidated, form resets or closes |
| 19.4 | Withdraw bid flow | Existing bid shown → click withdraw → confirm → success | `myBid` returns null, bid section shows "Submit" form again |
| 19.5 | Pagination flow | Navigate to page 2 → change filter → page resets to 0 | Back on page 1 with filtered results |
| 19.6 | Unauthenticated user | Load page → `useMyBid` disabled → no bid fetch | Bid form shown directly or hidden depending on auth UI |

---

## 6. Key Edge Cases Summary

- **`getMyBid` pagination limit**: Only fetches first 50 bids. If a user has 51+ bids, the matching bid for the current project may be missed.
- **Auto-select race condition**: If `projects` and `selectedId` update simultaneously, `useEffect` may call `onSelect` unnecessarily — the `!selectedId` guard prevents this but test it.
- **Filter object referential equality**: `useMemo` on `filters` must be tested — if it produces a new object reference on every render, React Query will treat it as a new query key and re-fetch constantly.
- **`placeholderData`**: When filters change, old data should remain visible during the new fetch (no flash of empty/loading state).
- **Concurrent mutations**: Submitting a bid while a withdrawal is in-flight should be prevented at the UI level.
- **`staleTime` on `useMyBid`**: Set to 60s — after a successful bid submission, `invalidateQueries` bypasses staleTime correctly.