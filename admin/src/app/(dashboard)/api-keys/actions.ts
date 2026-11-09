"use server";

import {revalidatePath} from "next/cache";
import {ApiKeySchema} from "@headdeck/shared";
import {createApiKey, deleteApiKey, expireApiKey,} from "@/lib/api/api-keys";
import {assertNotCurrentApiKey} from "@/lib/api/api-key-protection";

type ActionResult =
    | { success: true }
    | { success: false; error: string };

type CreateResult =
    | { success: true; apiKey: string }
    | { success: false; error: string };

function errorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
}

export async function createApiKeyAction(
    input: ApiKeySchema.CreateApiKey,
): Promise<CreateResult> {
    const parsed = ApiKeySchema.CreateApiKeySchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: "Invalid API key expiration.",
        };
    }

    try {
        const result = await createApiKey(parsed.data);

        revalidatePath("/api-keys");

        return {
            success: true,
            apiKey: result.apiKey,
        };
    } catch (error) {
        return {
            success: false,
            error: errorMessage(error),
        };
    }
}

export async function expireApiKeyAction(
    input: ApiKeySchema.ExpireApiKey,
): Promise<ActionResult> {
    const parsed = ApiKeySchema.ExpireApiKeySchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: "Invalid API key identifier.",
        };
    }

    try {
        await assertNotCurrentApiKey(parsed.data.prefix);
        await expireApiKey(parsed.data);

        revalidatePath("/api-keys");

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to expire API key",
        };
    }
}

export async function deleteApiKeyAction(
    input: ApiKeySchema.DeleteApiKey,
): Promise<ActionResult> {
    const parsed = ApiKeySchema.DeleteApiKeySchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: "Invalid API key prefix.",
        };
    }

    try {
        await assertNotCurrentApiKey(parsed.data.prefix);
        await deleteApiKey(parsed.data);

        revalidatePath("/api-keys");

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to delete API key",
        };
    }
}