import z from "zod";

export type Role = "CLIENT" | "FREELANCER" | "ADMIN";

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
    z.object({
        content: z.array(item),
        totalElements: z.number(),
        totalPages: z.number(),
        number: z.number(),
        size: z.number(),
        first: z.boolean(),
        last: z.boolean(),
    });

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
