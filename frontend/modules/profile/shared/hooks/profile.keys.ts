export const profileKeys = {
    all: () => ["profile"] as const,
    myBasic: () => ["profile", "me", "basic"] as const, // ← add
    myClient: () => ["profile", "me", "client"] as const,
    myFreelancer: () => ["profile", "me", "freelancer"] as const,
    freelancer: (id: string) => ["profile", "freelancer", id] as const,
    freelancerReviews: (id: string) =>
        ["profile", "reviews", "freelancer", id] as const,
    clientReviews: (id: string) =>
        ["profile", "reviews", "client", id] as const,
} as const;