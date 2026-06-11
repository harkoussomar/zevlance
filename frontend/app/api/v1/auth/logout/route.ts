import { NextRequest } from "next/server";
import { logoutServer } from "@/modules/auth/server/auth.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(_req: NextRequest) {
    try {
        return await logoutServer(_req);
    } catch (error) {
        return handleServerError(error, "Logout failed");
    }
}
