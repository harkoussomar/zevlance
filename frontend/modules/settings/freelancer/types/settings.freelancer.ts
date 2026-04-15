export interface UpdateFreelancerProfileRequest {
  name?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  skills?: string[] | null;
}
