export type AclDestination = {
    target: string;
    ports: string;
};

export function parseAclDestination(
    value: string,
): AclDestination | null {
    const separator = value.lastIndexOf(":");

    if (separator <= 0 || separator === value.length - 1) {
        return null;
    }

    const target = value.slice(0, separator);
    const ports = value.slice(separator + 1);

    if (!target || !ports) {
        return null;
    }

    return {target, ports};
}

export function validateAclPorts(
    value: string,
): string | null {
    const normalized = value.trim();

    if (normalized === "*") {
        return null;
    }

    if (!normalized) {
        return "Specify at least one port.";
    }

    const entries = normalized.split(",");

    for (const entry of entries) {
        const port = entry.trim();

        if (!/^\d+(?:-\d+)?$/.test(port)) {
            return `Invalid port specification: ${port || "(empty)"}`;
        }

        const [startText, endText] = port.split("-");
        const start = Number(startText);
        const end = Number(endText ?? startText);

        if (
            !Number.isSafeInteger(start) ||
            !Number.isSafeInteger(end) ||
            start < 1 ||
            end > 65535 ||
            start > end
        ) {
            return `Invalid port range: ${port}. Use 1–65535.`;
        }
    }

    return null;
}

export function formatAclDestination(
    target: string,
    ports: string,
): string {
    return `${target.trim()}:${ports.replace(/\s/g, "")}`;
}