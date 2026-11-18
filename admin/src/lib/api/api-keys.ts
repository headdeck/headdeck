import "server-only";

import {ApiKeySchema} from "@headdeck/shared";

import {headscaleRequest} from "@/lib/api/headscale-client";

export async function listApiKeys() {
    const response = await headscaleRequest(
        "/apikey",
        ApiKeySchema.ListApiKeysResponseSchema,
    );

    return response.apiKeys;
}

export async function createApiKey(input: ApiKeySchema.CreateApiKey) {
    const data = ApiKeySchema.CreateApiKeySchema.parse(input);

    return headscaleRequest(
        "/apikey",
        ApiKeySchema.CreateApiKeyResponseSchema,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}

export async function expireApiKey(input: ApiKeySchema.ExpireApiKey) {
    const data = ApiKeySchema.ExpireApiKeySchema.parse(input);

    return headscaleRequest(
        "/apikey/expire",
        ApiKeySchema.ExpireApiKeyResponseSchema,
        {
            method: "POST",
            body: JSON.stringify({prefix: data.prefix}),
        },
    );
}

export async function deleteApiKey(input: ApiKeySchema.DeleteApiKey) {
    const data = ApiKeySchema.DeleteApiKeySchema.parse(input);

    return headscaleRequest(
        `/apikey/${encodeURIComponent(data.prefix)}`,
        ApiKeySchema.DeleteApiKeyResponseSchema,
        {
            method: "DELETE",
        },
    );
}