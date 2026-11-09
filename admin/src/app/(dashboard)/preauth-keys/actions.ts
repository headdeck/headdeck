"use server";

import {revalidatePath} from "next/cache";

import {PreAuthKeySchema} from "@headdeck/shared";

import {createPreAuthKey, deletePreAuthKey, expirePreAuthKey, listPreAuthKeys,} from "@/lib/api/pre-auth-keys";

type ActionResult =
    | {
    success: true;
    key: string;
}
    | {
    success: false;
    error: string;
};

export async function createPreAuthKeyAction(
    input: PreAuthKeySchema.CreatePreAuthKey,
): Promise<ActionResult> {
    const parsed = PreAuthKeySchema.CreatePreAuthKeySchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid key configuration.",
        };
    }

    if (new Date(parsed.data.expiration).getTime() <= Date.now()) {
        return {
            success: false,
            error: "Expiration must be in the future.",
        };
    }

    try {
        const response = await createPreAuthKey(parsed.data);

        revalidatePath("/preauth-keys");

        return {
            success: true,
            key: response.preAuthKey.key,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to create pre-auth key.",
        };
    }
}

export async function expirePreAuthKeyAction(
    input: PreAuthKeySchema.ExpirePreAuthKey,
): Promise<
    | { success: true }
    | { success: false; error: string }
> {
    const parsed = PreAuthKeySchema.ExpirePreAuthKeySchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid key ID.",
        };
    }

    try {
        await expirePreAuthKey(parsed.data);

        revalidatePath("/preauth-keys");

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to expire pre-auth key.",
        };
    }
}

export async function deletePreAuthKeyAction(
    input: PreAuthKeySchema.DeletePreAuthKey,
): Promise<
    | { success: true }
    | { success: false; error: string }
> {
    const parsed = PreAuthKeySchema.DeletePreAuthKeySchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid key ID.",
        };
    }

    try {
        await deletePreAuthKey(parsed.data);

        revalidatePath("/preauth-keys");

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to delete pre-auth key.",
        };
    }
}

export type DeleteExpiredKeysResult =
    | {
    success: true;
    deletedIds: string[];
    failedIds: string[];
}
    | {
    success: false;
    error: string;
    deletedIds: string[];
    failedIds: string[];
};

export async function deleteExpiredPreAuthKeysAction(
    confirmation: string,
): Promise<DeleteExpiredKeysResult> {
    if (confirmation !== "DELETE EXPIRED KEYS") {
        return {
            success: false,
            error: "Invalid confirmation.",
            deletedIds: [],
            failedIds: [],
        };
    }

    let deletedIds: string[] = [];
    let failedIds: string[] = [];

    try {
        const {preAuthKeys} = await listPreAuthKeys();

        const expiredKeys = preAuthKeys.filter((key) => {
            const expiration = new Date(key.expiration).getTime();

            return Number.isFinite(expiration)
                && expiration <= Date.now();
        });

        for (const key of expiredKeys) {
            try {
                // Recheck the current record before deleting it.
                const {preAuthKeys: latestKeys} = await listPreAuthKeys();
                const latest = latestKeys.find(
                    (item) => item.id === key.id,
                );

                if (!latest) continue;

                const expiresAt = new Date(
                    latest.expiration,
                ).getTime();

                if (
                    !Number.isFinite(expiresAt)
                    || expiresAt > Date.now()
                ) {
                    continue;
                }

                await deletePreAuthKey({id: key.id});
                deletedIds.push(key.id);
            } catch {
                failedIds.push(key.id);
            }
        }

        revalidatePath("/preauth-keys");

        if (failedIds.length > 0) {
            return {
                success: false,
                error: `Deleted ${deletedIds.length} keys. Failed to delete ${failedIds.length} keys.`,
                deletedIds,
                failedIds,
            };
        }

        return {
            success: true,
            deletedIds,
            failedIds,
        };
    } catch (error) {
        if (deletedIds.length > 0) {
            revalidatePath("/preauth-keys");
        }

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to delete expired keys.",
            deletedIds,
            failedIds,
        };
    }
}