import { NextRequest, NextResponse } from "next/server";
import {
    getProjectsServer,
    createProjectServer,
} from "@/modules/project/shared/server/project.shared.server";
import { projectSchema } from "@/modules/project/client/schema/create.project.schema";
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

        // Build a clean query string from validated data
        const safeParams: Record<string, string> = {};
        const d = parsed.data;
        if (d.page !== undefined) safeParams.page = String(d.page);
        if (d.size !== undefined) safeParams.size = String(d.size);
        if (d.category) safeParams.category = d.category;
        if (d.status) safeParams.status = d.status;
        if (d.search) safeParams.search = d.search;
        if (d.sort) safeParams.sort = d.sort;
        if (d.minBudget !== undefined) safeParams.minBudget = String(d.minBudget);
        if (d.maxBudget !== undefined) safeParams.maxBudget = String(d.maxBudget);

        const qs = new URLSearchParams(safeParams).toString();
        const data = await getProjectsServer(qs);

        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch projects");
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = projectSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await createProjectServer(validationResult.data);

        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to create project");
    }
}
