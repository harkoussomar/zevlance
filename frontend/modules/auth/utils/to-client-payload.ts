import type { RegisterClientSchemaType } from "../schemas/register.schema";
import type { RegisterClientRequest } from "../types";

export function toClientPayload(data: RegisterClientSchemaType): RegisterClientRequest {
    const { confirmPassword, ...rest } = data;
    void confirmPassword; // ESLint safe

    return rest;
}
