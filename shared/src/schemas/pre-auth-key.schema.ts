import {z} from "zod";

import {UserSchema} from "@/schemas/user.schema.js";

export const PreAuthKeySchema = z.object({
    id: z.string(),
    key: z.string(),
    user: UserSchema.nullable(),
    reusable: z.boolean(),
    ephemeral: z.boolean(),
    used: z.boolean(),
    expiration: z.iso.datetime({offset: true}),
    createdAt: z.iso.datetime({offset: true}),
    aclTags: z.array(z.string()),
});

export const ListPreAuthKeysResponseSchema = z.object({
    preAuthKeys: z.array(PreAuthKeySchema),
});

export const CreatePreAuthKeySchema = z.object({
    user: z.string().min(1, "User is required"),
    reusable: z.boolean(),
    ephemeral: z.boolean(),
    expiration: z.iso.datetime({offset: true}),
    aclTags: z.array(
        z.string().regex(/^tag:[a-zA-Z0-9][a-zA-Z0-9-]*$/),
    ),
});

export const CreatePreAuthKeyResponseSchema = z.object({
    preAuthKey: PreAuthKeySchema,
});

export const ExpirePreAuthKeySchema = z.object({
    id: PreAuthKeySchema.shape.id,
});

export const ExpirePreAuthKeyResponseSchema = z.object({});

export const DeletePreAuthKeySchema = z.object({
    id: PreAuthKeySchema.shape.id,
});

export const DeletePreAuthKeyResponseSchema = z.object({});

export type PreAuthKey = z.infer<typeof PreAuthKeySchema>;
export type ListPreAuthKeysResponse = z.infer<typeof ListPreAuthKeysResponseSchema>;

export type CreatePreAuthKey = z.infer<typeof CreatePreAuthKeySchema>;
export type CreatePreAuthKeyResponse = z.infer<typeof CreatePreAuthKeyResponseSchema>;

export type ExpirePreAuthKey = z.infer<typeof ExpirePreAuthKeySchema>;
export type ExpirePreAuthKeyResponse = z.infer<typeof ExpirePreAuthKeyResponseSchema>;

export type DeletePreAuthKey = z.infer<typeof DeletePreAuthKeySchema>;
export type DeletePreAuthKeyResponse = z.infer<typeof DeletePreAuthKeyResponseSchema>;