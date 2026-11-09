import "server-only";

import {headers} from "next/headers";
import {getToken} from "next-auth/jwt";

export async function getHeadscaleApiKey(): Promise<string> {
    const requestHeaders = await headers();

    const token = await getToken({
        req: {
            headers: requestHeaders,
        },
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token || typeof token.apiKey !== "string" || !token.apiKey) {
        throw new Error("Unauthorized");
    }

    return token.apiKey;
}