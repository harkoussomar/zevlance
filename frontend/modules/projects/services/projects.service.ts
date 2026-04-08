import api from "@/modules/shared/lib/axios";
import type {
    CreateProjectRequest,
    MyProjectFilters,
    ProjectFilters,
    ProjectResponse,
    ProjectSummaryResponse,
    UpdateProjectRequest,
} from "../types";
import type { PaginatedResponse } from "@/modules/shared/types";

// ─── Projects (Public) ────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of projects for the marketplace.
 *
 * @method  GET /projects
 * @returns 200 OK — PaginatedResponse<ProjectSummaryResponse>
 */
export async function getProjects(
    filters: ProjectFilters,
): Promise<PaginatedResponse<ProjectSummaryResponse>> {
    // Strip undefined/empty values so they are never serialised into the query string.
    const params = Object.fromEntries(
        Object.entries(filters).filter(
            ([, v]) => v !== undefined && v !== null && v !== "",
        ),
    );

    const { data } = await api.get<PaginatedResponse<ProjectSummaryResponse>>(
        "/projects",
        { params },
    );
    return data;
}

/**
 * Fetch a single project by its ID.
 *
 * @method  GET /projects/{id}
 * @returns 200 OK — ProjectResponse
 * @throws  404 — not found
 */
export async function getProject(id: string): Promise<ProjectResponse> {
    const { data } = await api.get<ProjectResponse>(`/projects/${id}`);
    return data;
}

// ─── Projects (CLIENT) ────────────────────────────────────────────────────────

/**
 * Fetch the authenticated client's own projects (paginated).
 *
 * Only `page` and `size` are forwarded — extra fields on the filters object
 * are intentionally ignored to prevent accidental enum-conversion errors on
 * the backend (which accepts no filter params on this endpoint).
 *
 * @role    CLIENT only
 * @method  GET /projects/my?page=0&size=10
 * @returns 200 OK — PaginatedResponse<ProjectSummaryResponse>
 * @throws  401 — no token
 * @throws  403 — not a CLIENT
 */
export async function getMyProjects(
    filters: MyProjectFilters,
): Promise<PaginatedResponse<ProjectSummaryResponse>> {
    // Destructure explicitly so no stray fields (e.g. category) ever reach the backend.
    const { page, size } = filters;

    const { data } = await api.get<PaginatedResponse<ProjectSummaryResponse>>(
        "/projects/my",
        { params: { page, size } },
    );
    return data;
}

// ─── Create Project (CLIENT) ──────────────────────────────────────────────────

/**
 * Post a new project to the marketplace.
 *
 * @role    CLIENT only
 * @method  POST /projects
 * @returns 201 Created — ProjectResponse
 * @throws  400 — validation errors
 * @throws  401 — no token
 * @throws  403 — not a CLIENT
 *
 * Payload constraints (mirrored in projectSchema):
 *   - title         : required, max 200 chars
 *   - description   : required
 *   - budgetMin     : positive number
 *   - budgetMax     : positive, >= budgetMin
 *   - category      : one of the ProjectCategory enum values
 *   - deadline      : future date, format YYYY-MM-DD
 *   - requiredSkills: optional array of strings
 */
export async function createProject(
    payload: CreateProjectRequest,
): Promise<ProjectResponse> {
    const { data } = await api.post<ProjectResponse>("/projects", payload);
    return data;
}

// ─── Update Project (CLIENT owner) ───────────────────────────────────────────

/**
 * Partially update an existing project (only send changed fields).
 *
 * @role    CLIENT (owner only)
 * @method  PUT /projects/{id}
 * @returns 200 OK — ProjectResponse
 * @throws  400 — "Only OPEN projects can be edited"
 * @throws  401, 403, 404
 */
export async function updateProject(
    id: string,
    payload: UpdateProjectRequest,
): Promise<ProjectResponse> {
    const { data } = await api.put<ProjectResponse>(`/projects/${id}`, payload);
    return data;
}

// ─── Cancel Project (CLIENT owner) ───────────────────────────────────────────

/**
 * Cancel an open project.
 *
 * @role    CLIENT (owner only)
 * @method  DELETE /projects/{id}
 * @returns 204 No Content
 * @throws  400 — "Project is already cancelled"
 * @throws  401, 403, 404
 */
export async function cancelProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
}
