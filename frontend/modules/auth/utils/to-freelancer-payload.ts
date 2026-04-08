import type { RegisterFreelancerSchemaType } from "../schemas/register.schema";
import type { RegisterFreelancerRequest } from "../types";

export function toFreelancerPayload(data: RegisterFreelancerSchemaType): RegisterFreelancerRequest {
  // confirmPassword is a UI-only field — strip it before sending to the API.
  // The _confirmPassword prefix tells ESLint the omission is intentional.
  const { confirmPassword: _confirmPassword, ...rest } = data;
  return rest;
}