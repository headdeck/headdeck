import "server-only";

import {PolicySchema} from "@headdeck/shared";

import {headscaleRequest} from "@/lib/api/headscale-client";

export async function getPolicy(): Promise<PolicySchema.GetPolicyResponse> {
    return headscaleRequest(
        "/api/v1/policy",
        PolicySchema.GetPolicyResponseSchema,
    );
}

export async function setPolicy(
    input: PolicySchema.SetPolicy,
): Promise<PolicySchema.SetPolicyResponse> {
    const {policy} = PolicySchema.SetPolicySchema.parse(input);

    return headscaleRequest(
        "/api/v1/policy",
        PolicySchema.SetPolicyResponseSchema,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({policy}),
        },
    );
}