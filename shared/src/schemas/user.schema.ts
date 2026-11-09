import {z} from "zod";

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.iso.datetime({offset: true}),
    displayName: z.string(),
    email: z.string(),
    providerId: z.string(),
    provider: z.string(),
    profilePicUrl: z.string(),
});

export const ListUsersResponseSchema = z.object({
    users: z.array(UserSchema),
});

export const CreateUserSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Username is required")
        .max(63, "Username is too long")
        .regex(
            /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
            "Use lowercase letters, numbers, and internal hyphens",
        ),
});

export const CreateUserResponseSchema = z.object({
    user: UserSchema,
});

export const RenameUserSchema = z.object({
    id: UserSchema.shape.id,
    newName: CreateUserSchema.shape.name,
});

export const DeleteUserSchema = z.object({
    id: UserSchema.shape.id,
});

export const RenameUserResponseSchema = z.object({
    user: UserSchema,
});

export type RenameUserResponse = z.infer<typeof RenameUserResponseSchema>;
export type RenameUser = z.infer<typeof RenameUserSchema>;
export type DeleteUser = z.infer<typeof DeleteUserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;