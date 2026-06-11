import z from "zod";

export const RevenueDataPointSchema = z.object({
    date: z.string(),
    amount: z.number(),
});

export const UserGrowthDataPointSchema = z.object({
    date: z.string(),
    users: z.number(),
});

export const PlatformStatsSchema = z.object({
    // Users
    totalUsers:        z.number(),
    totalFreelancers:  z.number(),
    totalClients:      z.number(),
    suspendedUsers:    z.number().default(0),

    // Projects
    totalProjects:     z.number(),
    openProjects:      z.number(),
    inProgressProjects: z.number(),
    completedProjects: z.number(),
    flaggedProjects:   z.number().default(0),
    suspendedProjects: z.number().default(0),

    // Bids / contracts
    totalBids:          z.number(),
    totalContracts:     z.number(),
    activeContracts:    z.number(),
    completedContracts: z.number(),
    pendingDisputes:    z.number().default(0),

    // Reviews
    totalReviews:  z.number(),
    averageRating: z.number(),

    // Revenue
    revenueVolume: z.number().default(0),

    // Time series
    revenueOverTime:     z.array(RevenueDataPointSchema).default([]),
    userGrowthOverTime:  z.array(UserGrowthDataPointSchema).default([]),
});

export type PlatformStats        = z.infer<typeof PlatformStatsSchema>;
export type RevenueDataPoint     = z.infer<typeof RevenueDataPointSchema>;
export type UserGrowthDataPoint  = z.infer<typeof UserGrowthDataPointSchema>;