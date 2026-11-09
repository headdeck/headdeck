import "server-only";

import {RouteSchema} from "@headdeck/shared";

import {headscaleRequest} from "@/lib/api/headscale-client";

export async function setApprovedRoutes(
    input: RouteSchema.SetApprovedRoutes,
): Promise<RouteSchema.SetApprovedRoutesResponse> {
    const data = RouteSchema.SetApprovedRoutesSchema.parse(input);

    return headscaleRequest(
        `/api/v1/node/${encodeURIComponent(data.nodeId)}/approve_routes`,
        RouteSchema.SetApprovedRoutesResponseSchema,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                routes: data.routes,
            }),
        },
    );
}