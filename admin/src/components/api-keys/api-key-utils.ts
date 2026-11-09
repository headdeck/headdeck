import type {ApiKeySchema} from "@headdeck/shared";

export type ApiKey = ApiKeySchema.ApiKey;

export function isNeverExpiring(key: ApiKey): boolean {
    return key.expiration.startsWith("0001-01-01T00:00:00");
}

export function isExpired(
    key: ApiKey,
    now = Date.now(),
): boolean {
    if (isNeverExpiring(key)) return false;

    return new Date(key.expiration).getTime() <= now;
}

export function formatDate(value: string | null): string {
    if (!value) return "Never";

    if (value.startsWith("0001-01-01T00:00:00")) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(date);
}