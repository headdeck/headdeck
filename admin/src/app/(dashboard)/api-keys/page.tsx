import ApiKeysPage from "@/components/api-keys/api-keys-page";
import {listApiKeys} from "@/lib/api/api-keys";
import {
    getCurrentApiKey,
    isCurrentApiKey,
} from "@/lib/api/api-key-protection";

export default async function Page() {
    const apiKeys = await listApiKeys();
    const currentApiKey = await getCurrentApiKey();

    const currentApiKeyId =
        apiKeys.find((key) =>
            isCurrentApiKey(key.prefix, currentApiKey),
        )?.id ?? null;

    return (
        <ApiKeysPage
            apiKeys={apiKeys}
            currentApiKeyId={currentApiKeyId}
        />
    );
}