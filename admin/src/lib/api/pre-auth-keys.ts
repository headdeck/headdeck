import "server-only";

import {PreAuthKeySchema} from "@headdeck/shared";

import {headscaleRequest} from "@/lib/api/headscale-client";

export async function listPreAuthKeys(): Promise<PreAuthKeySchema.ListPreAuthKeysResponse> {
    return headscaleRequest(
        "/api/v1/preauthkey",
        PreAuthKeySchema.ListPreAuthKeysResponseSchema,
    );
}

export async function createPreAuthKey(
    input: PreAuthKeySchema.CreatePreAuthKey,
): Promise<PreAuthKeySchema.CreatePreAuthKeyResponse> {
    const data = PreAuthKeySchema.CreatePreAuthKeySchema.parse(input);

    return headscaleRequest(
        "/api/v1/preauthkey",
        PreAuthKeySchema.CreatePreAuthKeyResponseSchema,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        },
    );
}

export async function expirePreAuthKey(
    input: PreAuthKeySchema.ExpirePreAuthKey,
): Promise<PreAuthKeySchema.ExpirePreAuthKeyResponse> {
    const {id} = PreAuthKeySchema.ExpirePreAuthKeySchema.parse(input);

    return headscaleRequest(
        "/api/v1/preauthkey/expire",
        PreAuthKeySchema.ExpirePreAuthKeyResponseSchema,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({id}),
        },
    );
}

export async function deletePreAuthKey(
    input: PreAuthKeySchema.DeletePreAuthKey,
): Promise<PreAuthKeySchema.DeletePreAuthKeyResponse> {
    const {id} = PreAuthKeySchema.DeletePreAuthKeySchema.parse(input);

    const params = new URLSearchParams({id});

    return headscaleRequest(
        `/api/v1/preauthkey?${params.toString()}`,
        PreAuthKeySchema.DeletePreAuthKeyResponseSchema,
        {
            method: "DELETE",
        },
    );
}