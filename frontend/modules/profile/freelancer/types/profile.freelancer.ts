import type { BasicProfileResponse } from "../../shared";


export interface FreelancerProfileResponse extends BasicProfileResponse {
  role:               "FREELANCER";
  bio:                string | null;
  hourlyRate:         number | null;
  rating:             number;
  skills:             string[];
  completedContracts: number;
}