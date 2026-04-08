
export interface BasicProfileResponse {
    id:             string;
    name:           string;
    email:          string;
    role:           string;
    profilePicture: string | null;
}


export interface FreelancerProfileResponse {
  id: string;
  name: string;
  email: string;
  role: "FREELANCER";
  profilePicture: string | null;
  bio: string | null;
  hourlyRate: number | null;
  rating: number;
  skills: string[];
  /** Derived on the server from completed contracts */
  completedContracts: number;
}

// ─── Client Profile ───────────────────────────────────────────────────────────

export interface ClientProfileResponse {
  id: string;
  name: string;
  email: string;
  role: "CLIENT";
  profilePicture: string | null;
  companyName: string | null;
  companyDescription: string | null;
  website: string | null;
  rating: number;
  /** Derived on the server from the project module */
  postedProjects: number;
}




// ─── UI Helpers ───────────────────────────────────────────────────────────────

/** Used to drive the "view mode" of a profile page */
export type ProfileViewMode = "own" | "public";