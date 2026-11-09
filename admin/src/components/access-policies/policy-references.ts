import type {PolicySchema} from "@headdeck/shared";

export function findGroupReferences(
    policy: PolicySchema.PolicyDocument,
    groupName: string,
): string[] {
    const references: string[] = [];

    function visit(value: unknown, path: string) {
        if (typeof value === "string") {
            if (value === groupName) {
                references.push(path);
            }
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item, index) =>
                visit(item, `${path}[${index}]`),
            );
            return;
        }

        if (value && typeof value === "object") {
            for (const [key, item] of Object.entries(value)) {
                visit(item, `${path}.${key}`);
            }
        }
    }

    const {groups: _groups, ...rest} = policy;
    void _groups;

    visit(rest, "policy");

    return references;
}