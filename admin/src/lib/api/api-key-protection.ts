import "server-only";

import {getHeadscaleApiKey} from "@/lib/credential-helper";
import {listApiKeys} from "@/lib/api/api-keys";

export async function getCurrentApiKey(): Promise<string> {
    const apiKey = await getHeadscaleApiKey();

    if (!apiKey.startsWith("hskey-api-")) {
        throw new Error("Invalid Headscale API key format");
    }

    return apiKey;
}

export function isCurrentApiKey(
    listedPrefix: string,
    currentApiKey: string,
): boolean {
    if (
        !listedPrefix.startsWith("hskey-api-") ||
        !listedPrefix.endsWith("-***")
    ) {
        return false;
    }

    const visiblePrefix = listedPrefix.slice(0, -3);

    return currentApiKey.startsWith(visiblePrefix);
}

export async function assertNotCurrentApiKey(
    targetPrefix: string,
): Promise<void> {
    const [currentApiKey, apiKeys] = await Promise.all([
        getCurrentApiKey(),
        listApiKeys(),
    ]);

    const target = apiKeys.find(
        (key) => key.prefix === targetPrefix,
    );

    if (!target) {
        throw new Error("API key not found");
    }

    if (isCurrentApiKey(target.prefix, currentApiKey)) {
        throw new Error(
            "You cannot expire or delete the API key used by your current session.",
        );
    }
}