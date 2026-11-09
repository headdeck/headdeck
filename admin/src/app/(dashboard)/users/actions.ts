"use server";

import {revalidatePath} from "next/cache";

import {UserSchema} from "@headdeck/shared";

import {createUser, deleteUser, renameUser,} from "@/lib/api/users";
import {listNodes} from "@/lib/api/nodes";

type ActionResult =
    | { success: true }
    | { success: false; error: string };

function invalidInput(message: string): ActionResult {
    return {success: false, error: message};
}

export async function createUserAction(
    input: UserSchema.CreateUser,
): Promise<ActionResult> {
    const parsed = UserSchema.CreateUserSchema.safeParse(input);

    if (!parsed.success) {
        return invalidInput(
            parsed.error.issues[0]?.message ?? "Invalid username",
        );
    }

    try {
        await createUser(parsed.data);
        revalidatePath("/users");

        return {success: true};
    } catch {
        return invalidInput("Unable to create user. Please try again.");
    }
}

export async function renameUserAction(
    input: UserSchema.RenameUser,
): Promise<ActionResult> {
    const parsed = UserSchema.RenameUserSchema.safeParse(input);

    if (!parsed.success) {
        return invalidInput(
            parsed.error.issues[0]?.message ?? "Invalid input",
        );
    }

    try {
        await renameUser(parsed.data);

        revalidatePath("/users");
        revalidatePath("/nodes");

        return {success: true};
    } catch {
        return invalidInput("Unable to rename user. Please try again.");
    }
}

export async function deleteUserAction(
    input: UserSchema.DeleteUser,
): Promise<ActionResult> {
    const parsed = UserSchema.DeleteUserSchema.safeParse(input);

    if (!parsed.success) {
        return invalidInput(
            parsed.error.issues[0]?.message ?? "Invalid user ID",
        );
    }

    try {
        const {nodes} = await listNodes();

        if (nodes.some((node) => node.user.id === parsed.data.id)) {
            return invalidInput(
                "This user still owns registered nodes. Remove or transfer them before deleting the user.",
            );
        }

        await deleteUser(parsed.data);

        revalidatePath("/users");
        revalidatePath("/nodes");

        return {success: true};
    } catch {
        return invalidInput("Unable to delete user. Please try again.");
    }
}