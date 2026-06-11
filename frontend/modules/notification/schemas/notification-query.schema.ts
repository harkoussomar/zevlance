import { z } from "zod";

export const notificationQuerySchema = z.object({
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(100).default(20),
});

export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;
