// ─── features/settings/types.ts ───────────────────────────────────────────────
//
// Request shapes mirror the backend DTOs 1-to-1.
// null  = omit from request body (field left unchanged — patch semantics)
// ""    = explicitly clear the field on the server

// ─── Client ───────────────────────────────────────────────────────────────────

export interface UpdateClientProfileRequest {
  name?: string | null;
  profilePicture?: string | null;
  companyName?: string | null;
  companyDescription?: string | null;
  website?: string | null;
}

// ─── Freelancer ───────────────────────────────────────────────────────────────

export interface UpdateFreelancerProfileRequest {
  name?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  skills?: string[] | null;
}

// ─── Account ──────────────────────────────────────────────────────────────────

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}