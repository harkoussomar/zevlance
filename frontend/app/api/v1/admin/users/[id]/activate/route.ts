import { NextRequest, NextResponse } from "next/server";
import { activateUserServer } from "@/modules/admin/users/server/admin.users.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { z } from "zod";

const schema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invalid = validateId(id);
    if (invalid) return invalid;

    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Reason is required", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await activateUserServer(id, parsed.data.reason);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleServerError(error, "Failed to activate user");
  }
}