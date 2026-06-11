"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/modules/shared/components/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/modules/shared/components/select"; 

const ROLE_OPTIONS = [
  { value: "CLIENT", label: "Client" },
  { value: "FREELANCER", label: "Freelancer" },
];

const DEFAULT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Suspended" },
];

type FilterOption = {
  value: string;
  label: string;
};

type ExtraFilter = {
  key: string;
  placeholder: string;
  options: FilterOption[];
};

type AdminFiltersProps = {
  onSearchChange: (val: string) => void;
  onFilterChange: (key: string, val: string) => void;
  placeholder?: string;
  initialSearch?: string;
  filterValues?: Record<string, string | undefined>;
  showRoleFilter?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: FilterOption[];
  extraFilters?: ExtraFilter[];
};

export function AdminFilters({
  onSearchChange,
  onFilterChange,
  placeholder = "Search by email…",
  initialSearch = "",
  filterValues = {},
  showRoleFilter = false,
  showStatusFilter = false,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  extraFilters = [],
}: AdminFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  /**
   * FIX: The previous `useCallback(onSearchChange, [])` froze the callback at
   * mount — any parent update to `onSearchChange` was silently ignored (stale
   * closure). The correct pattern is to keep a ref that is always in sync with
   * the latest prop, then call through it inside the effect. This way the
   * debounce timer depends only on `searchTerm` while always invoking the
   * current callback.
   */
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }); // intentionally no dep-array: sync on every render

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChangeRef.current(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
      />
      
      {showRoleFilter && (
        <Select 
          value={filterValues.role ?? "all"}
          onValueChange={(val) => onFilterChange("role", val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full sm:max-w-50">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showStatusFilter && (
        <Select 
          value={filterValues.status ?? "all"}
          onValueChange={(val) => onFilterChange("status", val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full sm:max-w-50">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Render dynamically passed extra filters */}
      {extraFilters.map((filter) => (
        <Select 
          key={filter.key}
          value={filterValues[filter.key] ?? "all"}
          onValueChange={(val) => onFilterChange(filter.key, val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full sm:max-w-50">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.placeholder}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
