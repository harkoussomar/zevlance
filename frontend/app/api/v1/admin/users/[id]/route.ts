import { NextRequest, NextResponse } from "next/server";
import { handleServerError }   from "@/modules/shared/lib/bff/handle-server-error";
import { validateId }          from "@/modules/shared/lib/bff/validate-id";
import { getUserDetailServer } from "@/modules/admin/users/server/admin.users.server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invalid = validateId(id);
    if (invalid) return invalid;

    const data = await getUserDetailServer(id);
    return NextResponse.json(data);
  } catch (error) {
    return handleServerError(error, "Failed to fetch user detail");
  }
}