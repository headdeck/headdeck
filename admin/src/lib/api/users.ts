import "server-only";

import {z} from "zod";
import {UserSchema} from "@headdeck/shared";

import {headscaleRequest} from "@/lib/api/headscale-client";

export async function listUsers(): Promise<UserSchema.ListUsersResponse> {
    return headscaleRequest(
        "/api/v1/user",
        UserSchema.ListUsersResponseSchema,
    );
}

export async function createUser(
    input: UserSchema.CreateUser,
): Promise<UserSchema.CreateUserResponse> {
    const data = UserSchema.CreateUserSchema.parse(input);

    return headscaleRequest(
        "/api/v1/user",
        UserSchema.CreateUserResponseSchema,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        },
    );
}

export async function renameUser(
    input: UserSchema.RenameUser,
): Promise<UserSchema.RenameUserResponse> {
    const {id, newName} = UserSchema.RenameUserSchema.parse(input);

    return headscaleRequest(
        `/api/v1/user/${encodeURIComponent(id)}/rename/${encodeURIComponent(newName)}`,
        UserSchema.RenameUserResponseSchema,
        {
            method: "POST",
        },
    );
}

export async function deleteUser(
    input: UserSchema.DeleteUser,
): Promise<void> {
    const {id} = UserSchema.DeleteUserSchema.parse(input);

    await headscaleRequest(
        `/api/v1/user/${encodeURIComponent(id)}`,
        z.unknown(),
        {
            method: "DELETE",
        },
    );
}