"use server";

import {revalidatePath} from "next/cache";

import {NodeSchema} from "@headdeck/shared";

import {deleteNode, expireNode, renameNode, setNodeTags} from "@/lib/api/nodes";

type ActionResult =
    | { success: true }
    | { success: false; error: string };

export async function renameNodeAction(
    input: NodeSchema.RenameNode,
): Promise<ActionResult> {
    const parsed = NodeSchema.RenameNodeSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid node name",
        };
    }

    try {
        await renameNode(parsed.data);

        revalidatePath("/nodes");
        revalidatePath("/users");

        return {success: true};
    } catch {
        return {
            success: false,
            error: "Unable to rename node. Please try again.",
        };
    }
}

export async function expireNodeAction(
    input: NodeSchema.ExpireNode,
): Promise<ActionResult> {
    const parsed = NodeSchema.ExpireNodeSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid node ID",
        };
    }

    try {
        await expireNode(parsed.data);

        revalidatePath("/nodes");
        revalidatePath("/users");

        return {success: true};
    } catch {
        return {
            success: false,
            error: "Unable to expire node. Please try again.",
        };
    }
}

export async function setNodeTagsAction(
    input: NodeSchema.SetNodeTags,
): Promise<ActionResult> {
    const parsed = NodeSchema.SetNodeTagsSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid node tags",
        };
    }

    try {
        await setNodeTags(parsed.data);

        revalidatePath("/nodes");
        revalidatePath("/users");

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unable to update node tags. Please try again.",
        };
    }
}

export async function deleteNodeAction(
    input: NodeSchema.DeleteNode,
): Promise<ActionResult> {
    const parsed = NodeSchema.DeleteNodeSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid node ID",
        };
    }

    try {
        await deleteNode(parsed.data);

        revalidatePath("/nodes");
        revalidatePath("/users");

        return {success: true};
    } catch {
        return {
            success: false,
            error: "Unable to delete node. Please try again.",
        };
    }
}