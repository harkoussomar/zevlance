import { z } from "zod";


// ─── Users ───────────────────────────────────────────────────────────────────

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.enum(["CLIENT", "FREELANCER", "ADMIN"]),
  active: z.boolean(),
  joinedAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// ─── Params ──────────────────────────────────────────────────────────────────

export interface GetUsersParams {
  page: number;
  size?: number;
  role?: string;
  status?: string;
  search?: string;
}

// ─── User Detail ─────────────────────────────────────────────────────────────
export const UserDetailResponseSchema = z.object({
  id:              z.string(),
  email:           z.string(),
  name:            z.string().nullable(),
  phone:           z.string().nullable().optional(),
  profilePicture:  z.string().nullable().optional(),
  role:            z.enum(["CLIENT", "FREELANCER", "ADMIN"]),
  active:          z.boolean(),
  emailVerified:   z.boolean(),
  joinedAt:        z.string(),
  updatedAt:       z.string(),

  // stats (null when N/A for this role)
  totalProjects:   z.number().nullable().optional(),
  totalBids:       z.number().nullable().optional(),
  totalContracts:  z.number().nullable().optional(),
  averageRating:   z.number().nullable().optional(),
  totalReviews:    z.number().nullable().optional(),
});

export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;