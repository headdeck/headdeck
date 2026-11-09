import type {PolicyACLRule} from "@/schemas/policy.schema";

export type AclValidationIssue = {
    severity: "error" | "warning";
    field: "src" | "dst" | "proto";
    message: string;
};

export type AclValidationResult = {
    valid: boolean;
    errors: AclValidationIssue[];
    warnings: AclValidationIssue[];
};

const PORT_PROTOCOLS = new Set([
    "tcp",
    "udp",
    "sctp",
]);

const ICMP_PROTOCOLS = new Set([
    "icmp",
    "ipv6-icmp",
]);

function issue(
    severity: AclValidationIssue["severity"],
    field: AclValidationIssue["field"],
    message: string,
): AclValidationIssue {
    return {severity, field, message};
}

export function isAclIcmpProtocol(
    value: string | undefined,
): boolean {
    const proto = value?.trim().toLowerCase();

    return proto === "icmp" ||
        proto === "ipv6-icmp" ||
        proto === "1" ||
        proto === "58";
}

export function validateAclPortSpec(
    value: string,
): string | null {
    if (value === "*") return null;

    if (!value || value.includes("*")) {
        return "Use * alone or specify ports.";
    }

    for (const part of value.split(",")) {
        const match = /^(\d+)(?:-(\d+))?$/.exec(part);

        if (!match) {
            return `Invalid port specification: ${part}`;
        }

        const start = Number(match[1]);
        const end = Number(match[2] ?? match[1]);

        if (
            !Number.isSafeInteger(start) ||
            !Number.isSafeInteger(end) ||
            start < 1 ||
            end > 65535 ||
            start > end
        ) {
            return `Invalid port range: ${part}. Use 1–65535.`;
        }
    }

    return null;
}

export function splitAclDestination(
    value: string,
): { target: string; ports: string } | null {
    const separator = value.lastIndexOf(":");

    if (
        separator < 1 ||
        separator === value.length - 1
    ) {
        return null;
    }

    const target = value.slice(0, separator);
    const ports = value.slice(separator + 1);

    if (
        target.includes(":") &&
        !target.startsWith("tag:") &&
        !target.startsWith("group:") &&
        !target.startsWith("autogroup:") &&
        !target.startsWith("[")
    ) {
        return null;
    }

    if (
        target.startsWith("[") &&
        !/^\[[0-9a-fA-F:.]+\](?:\/\d{1,3})?$/.test(target)
    ) {
        return null;
    }

    return {target, ports};
}

export function validateAclRule(
    rule: PolicyACLRule,
): AclValidationResult {
    const issues: AclValidationIssue[] = [];
    const proto = rule.proto?.trim().toLowerCase();
    const icmp = isAclIcmpProtocol(proto);

    if (rule.src.length === 0) {
        issues.push(issue(
            "error",
            "src",
            "At least one source is required.",
        ));
    }

    if (rule.dst.length === 0) {
        issues.push(issue(
            "error",
            "dst",
            "At least one destination is required.",
        ));
    }

    if (rule.src.some((source) => !source.trim())) {
        issues.push(issue(
            "error",
            "src",
            "Sources cannot be empty.",
        ));
    }

    if (proto === "") {
        issues.push(issue(
            "error",
            "proto",
            "Remove the empty protocol value.",
        ));
    }

    if (proto) {
        const numeric = /^\d+$/.test(proto);

        if (numeric && Number(proto) > 255) {
            issues.push(issue(
                "error",
                "proto",
                "Protocol number must be between 0 and 255.",
            ));
        } else if (
            !numeric &&
            !PORT_PROTOCOLS.has(proto) &&
            !ICMP_PROTOCOLS.has(proto)
        ) {
            issues.push(issue(
                "warning",
                "proto",
                `Verify protocol "${rule.proto}" against Headscale.`,
            ));
        }
    }

    for (const destination of rule.dst) {
        const parsed = splitAclDestination(destination);

        if (!parsed) {
            issues.push(issue(
                "error",
                "dst",
                `Invalid destination format: ${destination}`,
            ));
            continue;
        }

        const portError = validateAclPortSpec(parsed.ports);

        if (portError) {
            issues.push(issue(
                "error",
                "dst",
                `${destination}: ${portError}`,
            ));
        }

        if (icmp && parsed.ports !== "*") {
            issues.push(issue(
                "error",
                "dst",
                `${destination}: ICMP requires * instead of transport ports.`,
            ));
        }

        if (
            proto &&
            !icmp &&
            !PORT_PROTOCOLS.has(proto) &&
            parsed.ports !== "*"
        ) {
            issues.push(issue(
                "warning",
                "proto",
                `${destination}: verify port compatibility with ${rule.proto}.`,
            ));
        }

        if (
            parsed.target === "*" &&
            parsed.ports === "*"
        ) {
            issues.push(issue(
                "warning",
                "dst",
                "Destination *:* allows access to all destinations and ports.",
            ));
        } else if (
            parsed.ports === "*" &&
            !icmp
        ) {
            issues.push(issue(
                "warning",
                "dst",
                `${destination} allows all ports for this destination.`,
            ));
        }

        if (
            parsed.target !== "*" &&
            !parsed.target.startsWith("tag:") &&
            !parsed.target.startsWith("group:") &&
            !parsed.target.startsWith("autogroup:") &&
            !parsed.target.startsWith("[") &&
            !/^[a-zA-Z0-9_.@/*-]+$/.test(parsed.target)
        ) {
            issues.push(issue(
                "warning",
                "dst",
                `Verify destination target: ${parsed.target}`,
            ));
        }
    }

    if (rule.src.includes("*")) {
        issues.push(issue(
            "warning",
            "src",
            "Wildcard source (*) allows all matching source nodes.",
        ));
    }

    return {
        valid: !issues.some(
            (item) => item.severity === "error",
        ),
        errors: issues.filter(
            (item) => item.severity === "error",
        ),
        warnings: issues.filter(
            (item) => item.severity === "warning",
        ),
    };
}