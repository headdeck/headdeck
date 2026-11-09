import "server-only";

import {getAvailablePolicyTags, parsePolicyDocument} from "@headdeck/shared";

import {getPolicy} from "@/lib/api/policy";

export async function listAvailablePolicyTags(): Promise<string[]> {
    const response = await getPolicy();

    const document = parsePolicyDocument(response.policy);

    return getAvailablePolicyTags(document);
}