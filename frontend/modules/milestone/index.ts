// ─── features/milestone/index.ts ─────────────────────────────────────────────
//
// Single entry-point for the milestone feature module.
// Consumers import from "@/modules/milestone" — not from deep internal paths.

export * from "./hooks/useMilestone";
export * from "./types";