import type { RegisterFreelancerSchemaType } from "../schemas/register.schema";
import type { RegisterFreelancerRequest } from "../types";

// Strip confirmPassword and empty optional strings before sending to the API
export function toFreelancerPayload(
    data: RegisterFreelancerSchemaType,
): RegisterFreelancerRequest {
    const { confirmPassword, ...rest } = data;
    void confirmPassword; // tell TypeScript/ESLint: yes, I know about it

    return rest;
}
