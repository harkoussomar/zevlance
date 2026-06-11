// app/api/v1/projects/my/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMyProjectsServer } from "@/modules/project/shared/server/project.shared.server";
import { projectQuerySchema } from "@/modules/project/shared/schemas/project-query.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET(req: NextRequest) {
    try {
        const rawParams = Object.fromEntries(
            [...req.nextUrl.searchParams.entries()].filter(
                ([, v]) => v != null && v !== "",
            ),
        );

        const parsed = projectQuerySchema.safeParse(rawParams);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid query parameters",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const safeParams: Record<string, string> = {};
        const d = parsed.data;
        if (d.page !== undefined) safeParams.page = String(d.page);
        if (d.size !== undefined) safeParams.size = String(d.size);
        if (d.category) safeParams.category = d.category;
        if (d.status) safeParams.status = d.status;
        if (d.search) safeParams.search = d.search;
        if (d.sort) safeParams.sort = d.sort;

        const qs = new URLSearchParams(safeParams).toString();
        const data = await getMyProjectsServer(qs);

        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch my projects");
    }
}
