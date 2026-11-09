"use server";

import {testHeadscaleConnection} from "@/lib/api/connection";

export async function testHeadscaleConnectionAction(): Promise<
    { success: true } | { success: false; error: string }
> {
    try {
        await testHeadscaleConnection();

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unable to connect to Headscale",
        };
    }
}