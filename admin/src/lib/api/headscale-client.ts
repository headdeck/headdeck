import "server-only";

import {z} from "zod";

import {getHeadscaleApiKey} from "@/lib/credential-helper";

export class HeadscaleApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "HeadscaleApiError";
    }
}

export async function headscaleRequest<T extends z.ZodType>(
    path: string,
    schema: T,
    options: RequestInit = {},
): Promise<z.output<T>> {
    const apiKey = await getHeadscaleApiKey();

    const baseUrl = process.env.HEADSCALE_URL;

    if (!baseUrl) {
        throw new Error("HEADSCALE_URL is not configured");
    }

    if (!path.startsWith("/") || path.startsWith("//")) {
        throw new Error("Headscale API path must be relative to the configured origin");
    }

    const url = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);

    const requestHeaders = new Headers(options.headers);
    requestHeaders.set("Authorization", `Bearer ${apiKey}`);

    const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
        cache: "no-store",
        redirect: "error",
    });

    if (!response.ok) {
        const fallback = `Headscale API request failed (${response.status})`;

        const body = await response.text();

        let message = "";

        if (body.trim()) {
            try {
                const parsed: unknown = JSON.parse(body);

                if (
                    typeof parsed === "object" &&
                    parsed !== null &&
                    "message" in parsed &&
                    typeof parsed.message === "string"
                ) {
                    message = parsed.message;
                } else if (
                    typeof parsed === "object" &&
                    parsed !== null &&
                    "error" in parsed &&
                    typeof parsed.error === "string"
                ) {
                    message = parsed.error;
                }
            } catch {
                // The response was not JSON.
                // Avoid exposing arbitrary HTML error pages.
            }
        }

        throw new Error(
            message
                ? `${fallback}: ${message}`
                : fallback,
        );
    }

    const data: unknown = await response.json();

    return schema.parse(data);
}