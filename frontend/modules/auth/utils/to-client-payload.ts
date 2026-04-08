import type { RegisterClientSchemaType } from "../schemas/register.schema";
import type { RegisterClientRequest } from "../types";

export function toClientPayload(data: RegisterClientSchemaType): RegisterClientRequest {
  // confirmPassword is a UI-only field — strip it before sending to the API.
  // The _confirmPassword prefix tells ESLint the omission is intentional.
  const { confirmPassword: _confirmPassword, ...rest } = data;
  return rest;
}