import { NextRequest, NextResponse } from "next/server";
import { getAdminUsersServer } from "@/modules/admin/users/server/admin.users.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { z } from "zod";

const schema = z.object({
  page:   z.coerce.number().min(0).default(0),
  size:   z.coerce.number().min(1).max(100).default(20),
  role:   z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid query params", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = await getAdminUsersServer(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    return handleServerError(error, "Failed to fetch users");
  }
}