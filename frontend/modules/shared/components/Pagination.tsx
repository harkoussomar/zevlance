import { Button } from "@/modules/shared/components/button";
import { cn } from "@/modules/shared";

// ─── pagination.tsx ───────────────────────────────────────────────────────────
//
// A fully reusable, accessible, zero-dependency Pagination component.
//
// Supports three usage patterns out of the box:
//
//   1. Client state  — pass `onPageChange` with a setState setter
//   2. URL params    — pass `onPageChange` with a router.push / searchParams handler
//   3. Controlled    — fully controlled via `page` + `onPageChange`
//
// Usage examples:
//
//   // 1. Client state
//   const [page, setPage] = useState(0);
//   <Pagination page={page} totalPages={10} onPageChange={setPage} />
//
//   // 2. URL-based (Next.js App Router)
//   const router = useRouter();
//   const page = Number(searchParams.get("page") ?? 0);
//   <Pagination page={page} totalPages={10} onPageChange={(p) => router.push(`?page=${p}`)} />
//
//   // 3. With sibling count customization
//   <Pagination page={page} totalPages={20} siblingCount={2} onPageChange={setPage} />
//
//   // 4. Hide prev/next labels
//   <Pagination page={page} totalPages={5} showLabels={false} onPageChange={setPage} />
//
// Notes:
//   - Pages are 0-indexed internally; displayed as 1-indexed to the user.
//   - The component is purely presentational — it never owns state.
//   - Fully accessible: aria-current, aria-label, aria-disabled, role="navigation".
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
    /** Current active page (0-indexed). */
    page: number;

    /** Total number of pages. */
    totalPages: number;

    /**
     * Called with the new 0-indexed page number when the user navigates.
     * Works with useState setters, router.push wrappers, or any callback.
     */
    onPageChange: (page: number) => void;

    /**
     * How many page buttons to show on each side of the current page.
     * @default 1
     */
    siblingCount?: number;

    /**
     * Show "Prev" / "Next" text labels inside the nav buttons.
     * @default true
     */
    showLabels?: boolean;

    /**
     * Additional className for the root <nav> element.
     */
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PageEntry = number | "…";

/**
 * Builds the list of page indices and ellipsis markers to render.
 *
 * Algorithm:
 *  - Always shows first and last page.
 *  - Shows `siblingCount` pages on each side of `page`.
 *  - Inserts "…" wherever there is a gap larger than 1.
 *  - Falls back to showing all pages when totalPages ≤ threshold.
 */
function buildPageEntries(
    page: number,
    totalPages: number,
    siblingCount: number,
): PageEntry[] {
    // Threshold: first + last + current + siblings on each side + 2 ellipses
    const threshold = 2 * siblingCount + 5;

    if (totalPages <= threshold) {
        return Array.from({ length: totalPages }, (_, i) => i);
    }

    const left = Math.max(1, page - siblingCount);
    const right = Math.min(totalPages - 2, page + siblingCount);

    const entries: PageEntry[] = [0];

    if (left > 1) entries.push("…");

    for (let i = left; i <= right; i++) entries.push(i);

    if (right < totalPages - 2) entries.push("…");

    entries.push(totalPages - 1);

    return entries;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Pagination({
    page,
    totalPages,
    onPageChange,
    siblingCount = 1,
    showLabels = true,
    className,
}: PaginationProps) {
    // Nothing to render for 0 or 1 pages.
    if (totalPages <= 1) return null;

    const entries = buildPageEntries(page, totalPages, siblingCount);

    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={cn("flex items-center justify-center gap-1.5", className)}
        >
            {/* ── Previous ── */}
            <Button
                variant="outline"
                size="sm"
                disabled={!canGoPrev}
                onClick={() => canGoPrev && onPageChange(page - 1)}
                aria-label="Go to previous page"
                aria-disabled={!canGoPrev}
                className="h-7 px-2.5 text-xs"
            >
                ← {showLabels && "Prev"}
            </Button>

            {/* ── Page numbers ── */}
            <ol className="flex gap-1" aria-label="Page list">
                {entries.map((entry, idx) =>
                    entry === "…" ? (
                        <li key={`ellipsis-${idx}`} aria-hidden="true">
                            <span className="w-7 h-7 flex items-center justify-center text-xs text-muted-foreground select-none">
                                …
                            </span>
                        </li>
                    ) : (
                        <li key={entry}>
                            <button
                                type="button"
                                onClick={() => onPageChange(entry)}
                                aria-label={`Page ${entry + 1}`}
                                aria-current={entry === page ? "page" : undefined}
                                className={cn(
                                    "w-7 h-7 rounded-lg text-xs font-semibold transition-colors",
                                    entry === page
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted",
                                )}
                            >
                                {entry + 1}
                            </button>
                        </li>
                    ),
                )}
            </ol>

            {/* ── Next ── */}
            <Button
                variant="outline"
                size="sm"
                disabled={!canGoNext}
                onClick={() => canGoNext && onPageChange(page + 1)}
                aria-label="Go to next page"
                aria-disabled={!canGoNext}
                className="h-7 px-2.5 text-xs"
            >
                {showLabels && "Next"} →
            </Button>
        </nav>
    );
}