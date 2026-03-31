import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type PaginationProps = {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
};

export const Pagination = ({ page, totalPages, setPage }: PaginationProps) => {
    // For large page counts, show a window of pages around the current one
    const getPageNumbers = (): (number | "…")[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }
        const pages: (number | "…")[] = [0];
        if (page > 2) pages.push("…");
        for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 3) pages.push("…");
        pages.push(totalPages - 1);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5">
            <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="h-7 px-2.5 text-xs"
            >
                ← Prev
            </Button>

            <div className="flex gap-1">
                {getPageNumbers().map((entry, idx) =>
                    entry === "…" ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="w-7 h-7 flex items-center justify-center text-xs text-muted-foreground"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={entry}
                            onClick={() => setPage(entry as number)}
                            className={cn(
                                "w-7 h-7 rounded-lg text-xs font-semibold transition-colors",
                                entry === page
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted",
                            )}
                        >
                            {(entry as number) + 1}
                        </button>
                    ),
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="h-7 px-2.5 text-xs"
            >
                Next →
            </Button>
        </div>
    );
};