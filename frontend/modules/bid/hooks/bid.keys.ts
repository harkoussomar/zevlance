import type { BidFilters } from "../types";

/**
 * Centralised key factory for all bid-related React Query cache entries.
 *
 * Key hierarchy:
 *   ["bids"]                                        ← all bid queries
 *   ["bids", "my"]                                  ← freelancer's bids (base)
 *   ["bids", "my", filters]                         ← freelancer's bids (paginated)
 *   ["bids", "my", "project", projectId]            ← freelancer's bid on a project
 *   ["bids", "project", projectId]                  ← project's bids (base, client)
 *   ["bids", "project", projectId, filters]         ← project's bids (paginated, client)
 *
 * Invalidating a parent key automatically busts every child key because
 * React Query matches by prefix.
 *
 * NOTE: `myBid` deliberately lives under the "my" namespace to avoid a cache
 * collision with `project` — both used to share `["bids", "project", id]`
 * but returned different data shapes (freelancer's single bid vs. client's
 * paginated list).
 */
export const bidKeys = {
  all: () => ["bids"] as const,

  mine: () => ["bids", "my"] as const,
  myList: (filters: BidFilters) => ["bids", "my", filters] as const,
  myBid: (projectId: string) => ["bids", "my", "project", projectId] as const,

  project: (projectId: string) => ["bids", "project", projectId] as const,
  projectList: (projectId: string, filters: BidFilters) =>
    ["bids", "project", projectId, filters] as const,
} as const;