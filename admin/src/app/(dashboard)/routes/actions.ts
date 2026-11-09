"use server";

import {revalidatePath} from "next/cache";

import {RouteSchema} from "@headdeck/shared";

import {setApprovedRoutes} from "@/lib/api/routes";

type ActionResult =
    | { success: true }
    | { success: false; error: string };

export async function setApprovedRoutesAction(
    input: RouteSchema.SetApprovedRoutes,
): Promise<ActionResult> {
    const parsed = RouteSchema.SetApprovedRoutesSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message
                ?? "Invalid route configuration.",
        };
    }

    try {
        await setApprovedRoutes(parsed.data);

        revalidatePath("/routes");
        revalidatePath("/nodes");

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Failed to update approved routes.",
        };
    }
}