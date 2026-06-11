import { z } from "zod";

export const AdminAuditLogSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  action: z.string(),
  targetEntityType: z.string(),
  targetEntityId: z.string(),
  reason: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>;
