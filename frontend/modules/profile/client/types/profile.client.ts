import type { BasicProfileResponse } from "../../shared/types/profile.shared";

export interface ClientProfileResponse extends BasicProfileResponse {
  role:               "CLIENT";
  companyName:        string | null;
  companyDescription: string | null;
  website:            string | null;
  rating:             number;
  postedProjects:     number;
}