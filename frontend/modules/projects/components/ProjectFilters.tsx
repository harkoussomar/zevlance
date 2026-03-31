import { Button, Card, CardContent, Input, Select } from "@/components/ui";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/lib/utils";
import { ProjectCategory, ProjectStatus } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface ProjectFilterProps {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: ProjectCategory | "") => void;
    status: string;
    setStatus: (value: ProjectStatus | "") => void;
    budgetMin: string;
    setBudgetMin: (value: string) => void;
    budgetMax: string;
    setBudgetMax: (value: string) => void;
    setPage: (value: number) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

export const ProjectFilter = ({
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    setPage,
    hasActiveFilters,
    clearFilters,
}: ProjectFilterProps) => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <>
            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-50">
                    <Input
                        placeholder="Search projects or skills…"
                        startIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                    />
                </div>
                <Button
                    variant={showFilters ? "default" : "outline"}
                    size="md"
                    onClick={() => setShowFilters((s) => !s)}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-1 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                            {
                                [category, status, budgetMin, budgetMax].filter(
                                    Boolean,
                                ).length
                            }
                        </span>
                    )}
                </Button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
                <Card>
                    <CardContent className="p-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                    Category
                                </label>
                                <Select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(
                                            e.target.value as
                                                | ProjectCategory
                                                | "",
                                        );
                                        setPage(0);
                                    }}
                                    placeholder="All Categories"
                                    options={CATEGORY_OPTIONS}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                    Status
                                </label>
                                <Select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(
                                            e.target.value as
                                                | ProjectStatus
                                                | "",
                                        );
                                        setPage(0);
                                    }}
                                    placeholder="All Statuses"
                                    options={STATUS_OPTIONS}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                    Budget Min ($)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="500"
                                    value={budgetMin}
                                    onChange={(e) => {
                                        setBudgetMin(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                                    Budget Max ($)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={budgetMax}
                                    onChange={(e) => {
                                        setBudgetMax(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                                <span className="text-xs text-muted-foreground">
                                    Active filters:
                                </span>
                                {category && (
                                    <button
                                        onClick={() => setCategory("")}
                                        className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full hover:bg-muted/80"
                                    >
                                        {
                                            CATEGORY_OPTIONS.find(
                                                (o) => o.value === category,
                                            )?.label
                                        }
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {status && (
                                    <button
                                        onClick={() => setStatus("")}
                                        className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full hover:bg-muted/80"
                                    >
                                        {
                                            STATUS_OPTIONS.find(
                                                (o) => o.value === status,
                                            )?.label
                                        }
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="ml-auto text-xs"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
};
