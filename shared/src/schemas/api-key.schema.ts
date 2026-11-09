import {z} from "zod";

export const ApiKeySchema = z.object({
    id: z.string(),
    prefix: z.string(),
    expiration: z.string(),
    createdAt: z.string(),
    lastSeen: z.string().nullable(),
});

export const ListApiKeysResponseSchema = z.object({
    apiKeys: z.array(ApiKeySchema),
});

export const CreateApiKeySchema = z.object({
    expiration: z.string().optional(),
});

export const CreateApiKeyResponseSchema = z.object({
    apiKey: z.string(),
});

export const ExpireApiKeySchema = z.object({
    prefix: z.string().min(1),
});

export const ExpireApiKeyResponseSchema = z.object({});

export const DeleteApiKeySchema = z.object({
    prefix: z.string().min(1),
});

export const DeleteApiKeyResponseSchema = z.object({});

export type ApiKey = z.infer<typeof ApiKeySchema>;
export type CreateApiKey = z.infer<typeof CreateApiKeySchema>;
export type ExpireApiKey = z.infer<typeof ExpireApiKeySchema>;
export type DeleteApiKey = z.infer<typeof DeleteApiKeySchema>;