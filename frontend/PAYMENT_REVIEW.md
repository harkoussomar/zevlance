# Payment System — Deep Expert Review

> Zevlance Frontend Payment Architecture, Flow Analysis, and Security Audit

---

## Executive Summary

Zevlance implements a **milestone-based escrow payment system** powered by **Stripe Checkout** (client payments) and **Stripe Connect** (freelancer payouts). The system is well-structured with clear separation of concerns, role-based access controls, and a robust state machine governing milestone lifecycle transitions. However, several architectural gaps and edge cases exist that warrant attention before production deployment.

---

## 1. Architecture Overview

### 1.1 Technology Stack

| Component | Technology |
|---|---|
| Payment Provider | Stripe (Checkout + Connect) |
| HTTP Client | Axios (configured at `modules/shared/lib/axios.ts`) |
| Server State | React Query (`@tanstack/react-query`) |
| Form Validation | Zod schemas |
| Toast Notifications | Sonner |
| UI Components | shadcn/ui + Radix UI |

### 1.2 Module Structure

```
modules/payment/          # Core payment operations
├── types.ts              # CheckoutSessionResponse, StripeConnectResponse
├── services/
│   └── payment.service.ts    # 4 API endpoints
├── hooks/
│   └── usePayment.ts         # 4 React Query hooks
└── index.ts              # ⚠️ EMPTY — no exports

modules/milestone/        # Milestone lifecycle (tightly coupled to payments)
├── types.ts              # MilestoneStatus (7 states), MilestoneResponse
├── schemas/
│   └── add-milestone.schema.ts  # Zod validation
├── services/
│   └── milestone.service.ts     # 5 API endpoints
├── hooks/
│   └── useMilestone.ts          # 5 React Query hooks + query key factory
└── components/
    ├── AddMilestoneCard.tsx
    ├── ClientMilestoneCard.tsx      # Fund/Refund UI
    └── FreelancerMilestoneCard.tsx  # Submit deliverable UI

modules/settings/
└── components/
    └── StripeConnectSection.tsx     # Freelancer onboarding UI
```

### 1.3 API Endpoints

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| `POST` | `/milestones/{id}/fund` | CLIENT | Create Stripe Checkout session for escrow funding |
| `POST` | `/milestones/{id}/refund` | CLIENT | Refund a funded milestone back to client |
| `POST` | `/stripe/connect/onboard` | FREELANCER | Create/retrieve Stripe Connect onboarding URL |
| `GET` | `/stripe/connect/status` | FREELANCER | Check if freelancer has completed Stripe Connect |
| `GET` | `/contracts/{id}/milestones` | BOTH | List milestones for a contract |
| `POST` | `/contracts/{id}/milestones` | CLIENT | Create a new milestone |
| `PUT` | `/milestones/{id}/submit` | FREELANCER | Submit deliverable URL |
| `PUT` | `/milestones/{id}/approve` | CLIENT | Approve milestone, release payment |
| `PUT` | `/milestones/{id}/revision` | CLIENT | Request revision (max 3) |

---

## 2. Payment Flow — Complete Lifecycle

### 2.1 Sequence Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MILESTONE PAYMENT LIFECYCLE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. PREREQUISITE: Freelancer completes Stripe Connect onboarding        │
│     Settings → Payments → "Connect Stripe Account" → Stripe OAuth       │
│                                                                         │
│  2. MILESTONE CREATED (CLIENT)                                          │
│     POST /contracts/{id}/milestones → status: PENDING                   │
│                                                                         │
│  3. MILESTONE FUNDED (CLIENT)                                           │
│     POST /milestones/{id}/fund → Stripe Checkout URL                    │
│     Browser redirects to Stripe → Client pays → Redirects back          │
│     ?funded=true&ms={milestoneId} → status: FUNDED                      │
│                                                                         │
│  4. DELIVERABLE SUBMITTED (FREELANCER)                                  │
│     PUT /milestones/{id}/submit {deliverableUrl} → status: SUBMITTED    │
│                                                                         │
│  5. CLIENT REVIEW                                                       │
│     ┌─ APPROVE: PUT /milestones/{id}/approve → status: APPROVED        │
│     │   Funds released to freelancer (minus platform fee)               │
│     │   If all milestones approved → contract auto-completes            │
│     │                                                                   │
│     └─ REVISION: PUT /milestones/{id}/revision → status: REVISION_     │
│                  REQUESTED (max 3 times)                                 │
│                  → Freelancer resubmits → back to step 4                │
│                  → If 3 revisions exhausted → must DISPUTE              │
│                                                                         │
│  6. REFUND PATH (CLIENT, any time before deliverable submission)        │
│     POST /milestones/{id}/refund → status: REFUNDED                     │
│     Only available when: status=FUNDED AND deliverableUrl=null          │
│                                                                         │
│  7. DISPUTE PATH (EITHER PARTY)                                         │
│     Contract-level dispute → status: DISPUTED                           │
│     Funds frozen pending manual review                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Milestone State Machine

```
                    ┌──────────┐
                    │ PENDING  │  ← Created, awaiting funding
                    └────┬─────┘
                         │ fund()
                    ┌────▼─────┐
                    │  FUNDED  │  ← Money in escrow
                    └────┬─────┘
                         │ submit()              refund()
                    ┌────▼──────────┐      ┌───────────┐
                    │  SUBMITTED    │      │  REFUNDED  │  ← Terminal
                    └────┬──────────┘      └───────────┘
                         │
              ┌──────────┼──────────┐
              │                      │
         approve()             revision() (max 3)
              │                      │
         ┌────▼─────┐          ┌─────▼────────────┐
         │ APPROVED │          │ REVISION_REQUESTED│ ── submit() ──► SUBMITTED
         │ Terminal │          └──────────────────┘
         └──────────┘

    DISPUTED can be triggered from any active state (contract-level action)
```

### 2.3 Financial Breakdown

Each `MilestoneResponse` includes:

| Field | Description |
|---|---|
| `amount` | Total milestone price (what client pays) |
| `platformFeeAmount` | Platform's cut (deducted from amount) |
| `freelancerPayout` | Net amount freelancer receives (`amount - platformFeeAmount`) |
| `fundedAt` | Timestamp when escrow was funded |
| `releasedAt` | Timestamp when payment was released to freelancer |

**Formula:** `amount = freelancerPayout + platformFeeAmount`

---

## 3. Component-Level Analysis

### 3.1 ClientMilestoneCard (`modules/milestone/components/ClientMilestoneCard.tsx` — 335 lines)

**Responsibilities:** Displays a single milestone from the client's perspective with action buttons.

**Payment UI States:**
- **PENDING:** Shows "Fund $X" button with escrow tooltip
- **FUNDED:** Shows escrow confirmation + "Refund $X" button (only if `deliverableUrl` is null)
- **SUBMITTED:** Shows "Approve & Release" + "Request Revision" buttons + payment breakdown (freelancer payout + platform fee)
- **APPROVED:** Shows payment release confirmation with timestamp
- **DISPUTED:** Shows frozen funds warning
- **REFUNDED:** Shows refund confirmation

**Strengths:**
- Clear visual distinction per status with color-coded borders
- Payment breakdown shown at approval time (transparency)
- Refund button correctly gated behind `!deliverableUrl` check
- Loading states properly managed via `isActing` guard (prevents concurrent actions)

**Concerns:**
- Uses hardcoded `$` prefix instead of `formatCurrency()` for tooltip text (line 192)
- Amount display in fund/refund tooltips uses `toFixed(2)` which may not match `formatCurrency`'s zero-decimal format

### 3.2 FreelancerMilestoneCard (`modules/contracts/components/FreelancerMilestoneCard.tsx` — 362 lines)

**Responsibilities:** Displays a single milestone from the freelancer's perspective with deliverable submission.

**Payment UI States:**
- **PENDING:** Warning banner — "Wait for client to deposit funds"
- **FUNDED:** Confirmation banner + expected payout amount
- **REVISION_REQUESTED:** Revision counter display
- **SUBMITTED:** "Awaiting client review" status
- **APPROVED:** Payment released confirmation with amount and date
- **DISPUTED:** "Frozen, team will contact within 48 hours"
- **REFUNDED:** "Client cancelled, payment refunded"

**Strengths:**
- `canSubmit` logic correctly gates submission to FUNDED or REVISION_REQUESTED states only
- URL validation with `isValidUrl()` using `new URL()` constructor
- Clear payout expectation shown before submission

**Concerns:**
- No explicit protection against submitting before Stripe Connect is connected (though backend would reject)
- Deliverable URL is a plain text input — no file upload support

### 3.3 ClientContractDetailPage (`modules/contracts/components/ClientContractDetailPage.tsx` — 552 lines)

**Responsibilities:** Central hub for contract management including all payment actions.

**Key Payment Code:**
- Lines 82-96: Stripe Checkout return handler (`?funded=true|false`)
- Lines 134-144: `useFundMilestone` and `useRefundMilestone` hooks
- Lines 217-241: Fund/refund dispatch with specific error handling for 422 (freelancer not onboarded) and 409 (invalid state)
- Lines 274-293: Dialog openers with escrow messaging

**Strengths:**
- Properly handles Stripe redirect return with URL cleanup (`router.replace`)
- Specific error messages for common failure modes
- Pre-invalidates React Query cache before redirect (`qc.invalidateQueries`)

**Concerns:**
- `useEffect` dependency array is empty (`[]`) with eslint-disable — fragile if component re-mounts
- No loading state shown during Stripe redirect (user could click fund again before redirect completes)
- Error handling for fund mutation inspects Axios error structure manually instead of using `parseApiError`

### 3.4 StripeConnectSection (`modules/settings/components/StripeConnectSection.tsx` — 109 lines)

**Responsibilities:** Freelancer Stripe Connect onboarding UI in Settings.

**Key Payment Code:**
- Lines 22-34: Handles `?stripe=success|refresh` return params
- Lines 48-73: Connected state with "Verified" badge and 2-day transfer info
- Lines 75-108: Not connected state with CTA button

**Strengths:**
- Clean two-state UI (connected vs not connected)
- Proper return URL handling with toast feedback
- Informative messaging about payout timeline

**Concerns:**
- No re-fetch of Stripe status after successful onboarding return (relies on page navigation to trigger fresh query)
- No retry mechanism if onboarding URL generation fails

### 3.5 ConfirmActionDialog (`modules/contracts/components/ConfirmActionDialog.tsx` — 91 lines)

**Responsibilities:** Confirmation dialog for contract and payment actions.

**Payment Action Configs:**
- `fund`: "Proceed to payment" — indigo styling
- `refund`: "Yes, refund milestone" — destructive styling

**Strengths:**
- Shared dialog for all actions with config-driven styling
- Pending state disables both buttons and changes label

---

## 4. React Query Architecture

### 4.1 Query Key Factory

```typescript
milestoneKeys = {
  all: () => ["milestones"],
  list: (contractId) => ["milestones", "list", contractId],
}
```

### 4.2 Cache Invalidation Matrix

| Mutation | Invalidates |
|---|---|
| `createMilestone` | `milestoneKeys.list(contractId)` |
| `submitDeliverable` | `milestoneKeys.list(contractId)` |
| `approveMilestone` | `milestoneKeys.list(contractId)` + `contractKeys.detail(contractId)` + `contractKeys.my()` |
| `requestRevision` | `milestoneKeys.list(contractId)` |
| `fundMilestone` | `milestoneKeys.list(contractId)` (pre-invalidated before redirect) |
| `refundMilestone` | `milestoneKeys.list(contractId)` |

**Assessment:** The invalidation strategy is well-designed. The `approveMilestone` mutation correctly invalidates contract-level queries because all-milestones-approved triggers auto-completion on the server.

### 4.3 Fund Mutation — Pre-Invalidation Pattern

```typescript
onSuccess: (data) => {
  qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
  window.location.href = data.checkoutUrl;  // Browser leaves the page
}
```

This is a clever pattern: the cache is invalidated *before* the redirect, so when the browser returns from Stripe, React Query re-fetches automatically on focus. This works because `window.location.href` causes a full page navigation, and React Query's default `refetchOnWindowFocus` will trigger the re-fetch.

---

## 5. Security Analysis

### 5.1 Strengths

| Area | Detail |
|---|---|
| **Credential handling** | `withCredentials: true` sends httpOnly JWT cookie — no token in JS memory |
| **Role-based access** | Payment endpoints are role-gated on the backend; frontend respects this through route separation |
| **CSRF protection** | httpOnly cookies + same-site policy (assumed backend config) |
| **401 interceptor** | Automatically logs out on session expiry, calls server-side logout to clear cookies |
| **No client-side amount manipulation** | Amounts come from the server (`MilestoneResponse`), never computed client-side |
| **Confirm dialogs** | Fund/refund actions require explicit confirmation with clear descriptions |

### 5.2 Concerns and Risks

| Severity | Issue | Detail |
|---|---|---|
| **MEDIUM** | No idempotency on fund/refund | If user double-clicks "Fund" before redirect, two Checkout sessions could be created. The `isActing` guard prevents UI double-clicks but not rapid programmatic calls. |
| **MEDIUM** | Stripe webhook not visible | The frontend has no webhook handling (expected — that's backend), but there's no UI for webhook failure states (e.g., Stripe confirms payment but backend didn't receive webhook). |
| **LOW** | Amount display inconsistency | `ClientMilestoneCard` uses `$${milestone.amount.toFixed(2)}` in tooltips (line 192) but `formatCurrency()` elsewhere. `formatCurrency` uses zero decimals, creating visual inconsistency. |
| **LOW** | No loading state during Stripe redirect | Between clicking "Fund" and browser redirect, there's a brief window where the button could be clicked again. The `isFunding` state should disable the button immediately. |
| **LOW** | `parseApiError` not used for fund errors | Lines 219-233 in `ClientContractDetailPage` manually inspect Axios error structure instead of using the shared `parseApiError` utility. |
| **LOW** | Empty barrel exports | `modules/payment/index.ts` and `modules/milestone/index.ts` are empty — imports use deep paths which makes refactoring harder. |
| **INFO** | No payment history/ledger | There's no dedicated payment history page. Users must navigate through contracts to see payment status. |
| **INFO** | No currency configuration | `formatCurrency` hardcodes `USD` — no support for multi-currency. |

### 5.3 Axios Interceptor — 401 Handling

The 401 interceptor at `modules/shared/lib/axios.ts:52-74` has the logout logic **commented out** (lines 67-68):

```typescript
/* useAuthStore.getState().logout();
window.location.replace("/login"); */
```

This means **session expiry does not trigger a logout redirect** in the current code. If the JWT expires during a payment flow, the user will see API errors but won't be redirected to login. This is a critical gap for production.

---

## 6. Error Handling Analysis

### 6.1 Documented Error Codes

| Endpoint | Error Code | Meaning |
|---|---|---|
| `POST /milestones/{id}/fund` | 409 | Milestone not in PENDING status |
| `POST /milestones/{id}/fund` | 422 | Freelancer has not connected Stripe |
| `POST /milestones/{id}/refund` | 409 | Milestone not in FUNDED status, or deliverableUrl is set |

### 6.2 Error Handling Coverage

| Flow | Error Handling | Quality |
|---|---|---|
| Fund milestone | Specific 422 and 409 handling, fallback to `parseApiError` | Good |
| Refund milestone | Generic `parseApiError` | Adequate |
| Stripe Connect onboarding | Generic "Failed to start onboarding" toast | Weak — no specific error codes |
| Stripe Connect status | React Query default error state | Adequate |
| Approve milestone | `parseApiError` with toast | Good |
| Submit deliverable | URL validation client-side, server errors via toast | Good |

---

## 7. UX Assessment

### 7.1 Strengths

- **Escrow transparency:** Both parties see exactly where money is at every stage
- **Payment breakdown:** Client sees platform fee vs freelancer payout at approval time
- **Progressive disclosure:** Fund/refund buttons only appear when relevant
- **Confirmation dialogs:** All financial actions require explicit confirmation
- **Toast feedback:** Clear success/error messages for all payment actions
- **Stripe return handling:** Clean URL cleanup prevents double-toasts on refresh
- **Role-aware UI:** Client and freelancer see completely different milestone cards appropriate to their role

### 7.2 Areas for Improvement

| Area | Current State | Recommendation |
|---|---|---|
| **Stripe failure state** | Only `?funded=false` handled | Add `?funded=error` for payment failures (expired card, insufficient funds) |
| **Payment receipt** | None | After funding, show a receipt/confirmation with Stripe session ID |
| **Payout timeline** | Static "2 business days" text | Show actual payout ETA based on Stripe Connect schedule |
| **Dispute payment UI** | Generic "funds frozen" message | Show frozen amount and expected resolution timeline |
| **Multi-milestone funding** | One at a time | Consider "Fund All" button for bulk milestone funding |
| **Payment method management** | None | Add ability for clients to manage saved payment methods |
| **Invoice generation** | None | Generate downloadable invoices for funded milestones |
| **Refund confirmation** | Toast only | Add email notification for refunds |

---

## 8. Code Quality Assessment

### 8.1 Strengths

- **TypeScript throughout:** All payment types are well-defined with `MilestoneResponse`, `CheckoutSessionResponse`, etc.
- **Zod validation:** `addMilestoneSchema` validates amount (positive, max $1M), dates (future only), and string lengths
- **Separation of concerns:** Service layer (API calls) → Hook layer (React Query) → Component layer (UI)
- **Query key factory:** Consistent, hierarchical key structure for cache management
- **JSDoc comments:** Service functions have clear `@role`, `@method`, `@throws` documentation

### 8.2 Technical Debt

| File | Issue | Impact |
|---|---|---|
| `modules/payment/index.ts` | Empty barrel file | Import paths are deep and fragile |
| `modules/milestone/index.ts` | Empty barrel file | Same as above |
| `modules/contracts/index.ts` | Empty barrel file | Same as above |
| `ClientContractDetailPage.tsx:96` | `eslint-disable` on empty deps | Fragile if component lifecycle changes |
| `ClientContractDetailPage.tsx:219-233` | Manual Axios error inspection | Duplicates logic that `parseApiError` should handle |
| `axios.ts:67-68` | 401 logout commented out | Session expiry doesn't redirect to login |

---

## 9. Recommendations

### 9.1 Critical (Must Fix Before Production)

1. **Uncomment 401 logout logic** in `axios.ts` — session expiry during payment flow is a security and UX risk
2. **Add idempotency protection** — prevent double-funding via mutation key deduplication or request deduplication
3. **Handle Stripe payment failures** — add `?funded=error` query param handling for declined cards

### 9.2 High Priority

4. **Add payment receipt/confirmation page** — after Stripe redirect, show a dedicated confirmation with transaction details
5. **Implement webhook failure UI** — show a warning if Stripe confirms payment but backend hasn't updated milestone status
6. **Add invoice generation** — downloadable PDF invoices for funded milestones
7. **Fix barrel exports** — populate `modules/payment/index.ts`, `modules/milestone/index.ts`, `modules/contracts/index.ts`

### 9.3 Medium Priority

8. **Add payment history page** — dedicated view of all payment transactions across all contracts
9. **Multi-currency support** — parameterize `formatCurrency` instead of hardcoding USD
10. **Add payment method management** — let clients manage saved cards in settings
11. **Improve Stripe Connect error handling** — specific error messages for onboarding failures
12. **Add "Fund All" button** — bulk funding for clients with multiple PENDING milestones

### 9.4 Low Priority

13. **Add email notifications** — for funding, refund, and payout events
14. **Payout ETA display** — dynamic estimated payout date based on Stripe schedule
15. **Dispute resolution timeline** — show expected resolution date for disputed milestones
16. **Payment analytics** — dashboard charts for earnings/spending over time

---

## 10. File Inventory

| File | Lines | Purpose |
|---|---|---|
| `modules/payment/types.ts` | 11 | Payment response types |
| `modules/payment/services/payment.service.ts` | 52 | 4 payment API endpoints |
| `modules/payment/hooks/usePayment.ts` | 87 | 4 React Query hooks |
| `modules/payment/index.ts` | 0 | ⚠️ Empty barrel |
| `modules/milestone/types.ts` | 36 | Milestone state machine + types |
| `modules/milestone/services/milestone.service.ts` | 109 | 5 milestone API endpoints |
| `modules/milestone/hooks/useMilestone.ts` | 148 | 5 React Query hooks + query keys |
| `modules/milestone/schemas/add-milestone.schema.ts` | 37 | Zod validation for milestone creation |
| `modules/milestone/components/ClientMilestoneCard.tsx` | 335 | Client milestone UI with fund/refund |
| `modules/milestone/components/AddMilestoneForm.tsx` | 154 | Milestone creation form |
| `modules/contracts/types.ts` | 39 | Contract types + action types |
| `modules/contracts/components/ClientContractDetailPage.tsx` | 552 | Client contract detail (payment hub) |
| `modules/contracts/components/FreelancerMilestoneCard.tsx` | 362 | Freelancer milestone UI |
| `modules/contracts/components/ConfirmActionDialog.tsx` | 91 | Confirmation dialog with payment actions |
| `modules/contracts/components/ContractsPage.tsx` | 297 | Contract list with financial summary |
| `modules/contracts/components/ContractSidebar.tsx` | 239 | Sidebar with financial calculations |
| `modules/settings/components/StripeConnectSection.tsx` | 109 | Stripe Connect onboarding UI |
| `modules/settings/components/SettingsPage.tsx` | 254 | Settings page with payments tab |
| `modules/shared/utils/currency.ts` | 12 | Currency formatting utilities |
| `modules/shared/lib/axios.ts` | 76 | HTTP client with auth interceptors |
| `modules/shared/config/status.config.ts` | 148 | Status styling (including milestones) |
| `modules/shared/components/status-badge.tsx` | 106 | Status badge component (including milestones) |

**Total: 22 files, ~2,850 lines of payment-related code**

---

## 11. Verdict

The payment system is **well-architected for an MVP** with clear separation of concerns, proper role-based access, and a robust milestone state machine. The Stripe integration follows best practices (Checkout for payments, Connect for payouts) and the React Query caching strategy is sound.

**Primary risks before production:**
1. The commented-out 401 logout is a security gap
2. No idempotency protection for payment mutations
3. No handling for Stripe payment failures (only success/cancel)
4. No webhook failure detection UI

**Overall rating: 7/10** — Solid foundation with clear paths to production readiness.
