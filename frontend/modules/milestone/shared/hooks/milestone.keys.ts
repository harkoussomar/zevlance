export const milestoneKeys = {
  all: () => ["milestones"] as const,
  list: (contractId: string) => ["milestones", "list", contractId] as const,
} as const;