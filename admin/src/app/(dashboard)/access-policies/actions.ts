"use server";

import {revalidatePath} from "next/cache";

import {parsePolicyDocument, PolicySchema,} from "@headdeck/shared";

import {getPolicy, setPolicy} from "@/lib/api/policy";

type PublishPolicyResult =
    | {
    success: true;
    policy: string;
    updatedAt: string | null;
}
    | {
    success: false;
    error: string;
    conflict?: boolean;
};

export async function publishPolicyAction(
    input: {
        originalPolicy: string;
        draft: string;
    },
): Promise<PublishPolicyResult> {
    const original = PolicySchema.SetPolicySchema.safeParse({
        policy: input.originalPolicy,
    });

    const submitted = PolicySchema.SetPolicySchema.safeParse({
        policy: input.draft,
    });

    if (!original.success || !submitted.success) {
        return {
            success: false,
            error: "Invalid policy publishing request.",
        };
    }

    try {
        // Validate the actual document on the server.
        parsePolicyDocument(submitted.data.policy);

        // Check whether the live policy changed after loading.
        const current = await getPolicy();

        if (current.policy !== original.data.policy) {
            return {
                success: false,
                conflict: true,
                error:
                    "The live policy has changed since this editor was opened. " +
                    "Publishing was cancelled to prevent overwriting those changes.",
            };
        }

        if (submitted.data.policy === current.policy) {
            return {
                success: false,
                error: "There are no changes to publish.",
            };
        }

        // Full-document replacement.
        await setPolicy({
            policy: submitted.data.policy,
        });

        // Read back the policy actually stored by Headscale.
        const updated = await getPolicy();

        revalidatePath("/access-policies");

        return {
            success: true,
            policy: updated.policy,
            updatedAt: updated.updatedAt ?? null,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to publish policy.",
        };
    }
}