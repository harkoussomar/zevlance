export interface BasicProfileResponse {
  id:             string;
  name:           string;
  email:          string;
  role:           string;
  profilePicture: string | null;
}

/** Used to drive the "view mode" of a profile page */
export type ProfileViewMode = "own" | "public";