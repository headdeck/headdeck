import "server-only";

import {z} from "zod";

import {headscaleRequest} from "@/lib/api/headscale-client";

const ConnectionResponseSchema = z.object({
    users: z.array(z.unknown()),
});

export async function testHeadscaleConnection(): Promise<void> {
    await headscaleRequest(
        "/api/v1/user",
        ConnectionResponseSchema,
    );
}

export function getHeadscaleServerUrl(): string | null {
    return process.env.HEADSCALE_URL ?? null;
}