export const reviewKeys = {
  all:        () => ["reviews"] as const,
  freelancer: (freelancerId: string) => ["reviews", "freelancer", freelancerId] as const,
  client:     (clientId: string)     => ["reviews", "client", clientId] as const,
} as const;