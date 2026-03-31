import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_STYLES,
  BID_STATUS_STYLES,
  CONTRACT_STATUS_STYLES,
  MILESTONE_STATUS_STYLES,
  CATEGORY_STYLES,
} from "@/lib/utils";
import type {
  ProjectStatus,
  BidStatus,
  ContractStatus,
  MilestoneStatus,
  ProjectCategory,
} from "@/types";

interface StatusBadgeProps {
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: { status: ProjectStatus } & StatusBadgeProps) {
  const style = PROJECT_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}

export function BidStatusBadge({
  status,
  className,
}: { status: BidStatus } & StatusBadgeProps) {
  const style = BID_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}

export function ContractStatusBadge({
  status,
  className,
}: { status: ContractStatus } & StatusBadgeProps) {
  const style = CONTRACT_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}

export function MilestoneStatusBadge({
  status,
  className,
}: { status: MilestoneStatus } & StatusBadgeProps) {
  const style = MILESTONE_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: { category: ProjectCategory } & StatusBadgeProps) {
  const style = CATEGORY_STYLES[category];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}