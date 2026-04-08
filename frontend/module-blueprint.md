# Feature Module Blueprint

> Hand this document to an agent to build any new feature module following the exact same architecture, patterns, and conventions as the **Projects** module.

---

## 1. What is a Feature Module?

A feature module is a **fully self-contained vertical slice** of the application. It owns everything for one domain: data fetching, state, validation, and UI. It communicates with the rest of the app only through its `index.ts` barrel export.

---

## 2. Directory Structure

Always create the following structure under `features/<module-name>/`:

```
features/<module-name>/
├── api/
│   └── <resource>.service.ts     # One file per backend resource
├── components/
│   └── <ComponentName>.tsx        # One file per component
├── hooks/
│   └── use<Resource>.ts           # One file per resource (queries + mutations)
├── schemas/
│   └── create-<resource>.schema.ts
├── types.ts                       # Domain-specific types only
└── index.ts                       # Barrel — public API surface
```

---

## 3. Layer Rules (Non-Negotiable)

```
Components  →  only import from hooks/ and @/components/ui
Hooks       →  only import from api/ and external libs (React Query, zustand)
API         →  only imports axios instance from @/lib/axios and @/types
Schemas     →  only import from zod
Types       →  no imports (pure type definitions)
index.ts    →  re-exports from all layers selectively
```

**Never:**
- Import an API service directly inside a component
- Import hooks inside API services
- Export internal query keys from `index.ts` unless another module needs them

---

## 4. API Service File Pattern

```ts
// features/<module>/api/<resource>.service.ts
import api from "@/lib/axios";
import type { YourType } from "@/types";

/**
 * JSDoc on every function.
 * Describe the HTTP method, path, and who can call it (role).
 */
export async function getItems(filters: Filters): Promise<PaginatedResponse<ItemSummary>> {
  const { data } = await api.get<PaginatedResponse<ItemSummary>>("/items", { params: filters });
  return data;
}

export async function getItem(id: string): Promise<ItemResponse> {
  const { data } = await api.get<ItemResponse>(`/items/${id}`);
  return data;
}

export async function createItem(payload: CreateItemRequest): Promise<ItemResponse> {
  const { data } = await api.post<ItemResponse>("/items", payload);
  return data;
}

export async function updateItem(id: string, payload: UpdateItemRequest): Promise<ItemResponse> {
  const { data } = await api.put<ItemResponse>(`/items/${id}`, payload);
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  await api.delete(`/items/${id}`);
}
```

**Rules:**
- Always destructure `{ data }` from axios response — never return the full axios response
- Always type the generic on axios calls: `api.get<YourType>(...)`
- Catch 404s explicitly only when `null` is a valid return value (like `getMyBid`)
- Re-throw all other errors — let React Query handle them

---

## 5. Hooks File Pattern

```ts
// features/<module>/hooks/use<Resource>.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resourceApi from "../api/<resource>.service";
import type { Filters } from "@/types";

// ─── Query Keys ────────────────────────────────────────────────────────────
// Always define keys as an object with factory functions
// Keys must be hierarchical — parent keys invalidate children
export const resourceKeys = {
  all: () => ["resources"] as const,
  lists: () => ["resources", "list"] as const,
  list: (filters: Filters) => ["resources", "list", filters] as const,
  details: () => ["resources", "detail"] as const,
  detail: (id: string) => ["resources", "detail", id] as const,
};

// ─── Queries ───────────────────────────────────────────────────────────────
export function useItems(filters: Filters) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: () => resourceApi.getItems(filters),
    placeholderData: (prev) => prev, // keep old data visible during filter changes
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => resourceApi.getItem(id),
    enabled: !!id, // always guard against empty/undefined ids
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────
export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemRequest) => resourceApi.createItem(payload),
    onSuccess: () => {
      // Invalidate the list so it refreshes — use parent key to catch all list variants
      qc.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

export function useDeleteItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => resourceApi.deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resourceKeys.lists() });
      qc.removeQueries({ queryKey: resourceKeys.detail(id) });
    },
  });
}
```

**Rules:**
- Always define query keys as an object of factory functions at the top
- Always use `enabled: !!id` for single-resource queries
- Always use `placeholderData: (prev) => prev` for list queries
- Always invalidate related queries in mutation `onSuccess`
- Never put loading/error UI logic inside hooks — return raw React Query state
- Conditionally disable queries based on auth state (use zustand auth store)

---

## 6. Schema File Pattern

```ts
// features/<module>/schemas/create-<resource>.schema.ts
import { z } from "zod";

export const createResourceSchema = z.object({
  // String fields: always set min AND max
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),

  // Number fields: use z.coerce.number() so HTML inputs (string) coerce correctly
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .positive("Price must be greater than 0")
    .max(1_000_000, "Price too high"),

  // Enums: always provide a human-readable error message
  category: z.enum(["A", "B", "C"], { message: "Please select a category" }),

  // Arrays: always set min AND max
  tags: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one tag required")
    .max(10, "Max 10 tags"),

  // Dates as strings with refinement
  deadline: z
    .string({ message: "Deadline is required" })
    .refine(
      (d) => !isNaN(Date.parse(d)) && new Date(d) > new Date(),
      "Deadline must be a valid future date"
    ),
})
// Cross-field validation with .refine() — always specify path
.refine((data) => data.maxValue >= data.minValue, {
  message: "Max must be ≥ min",
  path: ["maxValue"],
});

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>;
```

---

## 7. Component Patterns

### List Panel Component

```tsx
"use client";

// Owns filter state + pagination state internally
// Communicates upward only via onSelect(id) callback
// Never fetches data directly — uses hooks

export function ResourceListPanel({ selectedId, onSelect }: Props) {
  // All filter state lives here
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Memoize filters to avoid unnecessary re-queries
  const filters = useMemo(() => ({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
  }), [page, search]);

  const { data, isLoading, error } = useItems(filters);

  // Auto-select first item on load
  useEffect(() => {
    if (data?.content.length && !selectedId) {
      onSelect(data.content[0].id);
    }
  }, [data, selectedId, onSelect]);

  // Always reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0); // ← always reset page on filter change
  };

  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filters */}
      {/* List with loading skeleton */}
      {/* Pagination — only render if totalPages > 1 */}
    </div>
  );
}
```

### Form Component

```tsx
"use client";

// Always use react-hook-form + standardSchemaResolver
// Show persistent error Alert for server/mutation errors
// Call onSuccess?() after successful mutation

export function ResourceForm({ resourceId, onSuccess }: Props) {
  const createResource = useCreateItem();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: standardSchemaResolver(createResourceSchema),
    });

  const onSubmit = async (values: FormValues) => {
    await createResource.mutateAsync(values);
    onSuccess?.();
  };

  const serverError = createResource.isError
    ? (createResource.error as Error)?.message ?? "Something went wrong."
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <Alert variant="destructive">{serverError}</Alert>}
      {/* Fields */}
      <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

**Rules:**
- All form components: `noValidate` on `<form>` (let Zod handle validation)
- Always use `mutateAsync` (not `mutate`) so you can `await` and call `onSuccess?.()`
- Always show a server error `Alert` — never silently fail
- Button must have `loading` and `disabled` states during submission

---

## 8. Types File Pattern

```ts
// features/<module>/types.ts
// Only put types that are NOT shared globally in @/types

export type ResourceStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface CreateResourceRequest {
  name: string;
  price: number;
}

export interface UpdateResourceRequest {
  status: Extract<ResourceStatus, "ACTIVE" | "INACTIVE">;
}
```

**Rules:**
- Shared/global types (paginated response shapes, common enums used across modules) go in `@/types`
- Module-specific request/response types and status enums go in `features/<module>/types.ts`

---

## 9. `index.ts` Barrel Pattern

```ts
// features/<module>/index.ts

// ─── Hooks ─────────────────────────────────────────────────────────────────
export { useItems, useItem } from "./hooks/useResource";
export { useCreateItem, useDeleteItem } from "./hooks/useResource";

// ─── Components ────────────────────────────────────────────────────────────
export { ResourceListPanel } from "./components/ResourceListPanel";
export { ResourceDetailPanel } from "./components/ResourceDetailPanel";
export { ResourceCard } from "./components/ResourceCard";
export { ResourceForm } from "./components/ResourceForm";

// ─── Schemas ───────────────────────────────────────────────────────────────
export { createResourceSchema } from "./schemas/create-resource.schema";
export type { CreateResourceFormValues } from "./schemas/create-resource.schema";

// ─── Types ─────────────────────────────────────────────────────────────────
export type { ResourceStatus, CreateResourceRequest } from "./types";

// ─── Do NOT export ─────────────────────────────────────────────────────────
// resourceKeys — internal, only export if another module needs to invalidate these queries
// API service functions — internal implementation detail
```

---

## 10. Checklist Before Marking a Module Complete

- [ ] Every API function has a JSDoc comment
- [ ] All query keys use factory functions and are hierarchical
- [ ] All list queries use `placeholderData: (prev) => prev`
- [ ] All single-item queries use `enabled: !!id`
- [ ] All mutations invalidate related queries in `onSuccess`
- [ ] All form components show a server error `Alert`
- [ ] All form submit buttons are disabled + show loading during submission
- [ ] `filters` object in list panels is wrapped in `useMemo`
- [ ] Page resets to 0 on every filter change
- [ ] `index.ts` only exports the public API — no internals
- [ ] No component imports from `api/` directly
- [ ] Module has a corresponding test scenarios document
- [ ] Module has a corresponding documentation document