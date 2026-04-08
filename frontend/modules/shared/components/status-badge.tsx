import { cn } from "@/modules/shared";
import {
    PROJECT_STATUS_STYLES,
    BID_STATUS_STYLES,
    CONTRACT_STATUS_STYLES,
    MILESTONE_STATUS_STYLES,
    CATEGORY_STYLES,
} from "@/modules/shared";
import { BidStatus } from "@/modules/bid/types";
import { ContractStatus } from "@/modules/contracts/types";
import { MilestoneStatus } from "@/modules/milestone/types";
import { ProjectCategory, ProjectStatus } from "@/modules/projects/types";

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
                className,
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
                className,
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
                className,
            )}
        >
            {style.label}
        </span>
    );
}

export function MilestoneStatusBadge({
  status,
  className,
}: { status?: MilestoneStatus } & StatusBadgeProps) {
  const style = status ? MILESTONE_STATUS_STYLES[status] : undefined;

  // fallback if status is invalid/missing
  const safeStyle = style ?? { className: "bg-gray-100 text-gray-500", label: "Unknown" };

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
        safeStyle.className,
        className,
      )}
    >
      {safeStyle.label}
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
                className,
            )}
        >
            {style.label}
        </span>
    );
}
