import {applyEdits, modify,} from "jsonc-parser";
import {type PolicyACLRule, PolicyACLRuleSchema} from "@/schemas/policy.schema";
import {parsePolicyDocument} from "./policy.js";
import {validateAclRule} from "./policy-acl-validation.js";

export function updatePolicyMapEntry(
    source: string,
    section: "groups" | "tagOwners",
    name: string,
    members: string[] | undefined,
): string {
    const edits = modify(
        source,
        [section, name],
        members,
        {
            formattingOptions: {
                insertSpaces: true,
                tabSize: 2,
                eol: "\n",
            },
        },
    );

    return applyEdits(source, edits);
}

export function updatePolicyAcl(
    source: string,
    index: number | null,
    rule: PolicyACLRule | undefined,
): string {
    // Validate additions and replacements.
    if (rule !== undefined) {
        PolicyACLRuleSchema.parse(rule);

        const validation = validateAclRule(rule);

        if (!validation.valid) {
            throw new Error(
                validation.errors
                    .map((item) => item.message)
                    .join("\n"),
            );
        }
    }

    const policy = parsePolicyDocument(source);
    const rules = policy.acls ?? [];

    if (index !== null && (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= rules.length
    )) {
        throw new Error("ACL rule no longer exists");
    }

    if (index === null && rule === undefined) {
        throw new Error("Cannot delete an unspecified ACL");
    }

    // If the section is missing, initialize it first.
    if (!policy.acls) {
        if (rule === undefined) {
            throw new Error("No ACL rules to delete");
        }

        const edits = modify(source, ["acls"], [rule], {
            formattingOptions: {
                insertSpaces: true,
                tabSize: 2,
                eol: "\n",
            },
        });

        return applyEdits(source, edits);
    }

    const path = [
        "acls",
        index === null ? -1 : index,
    ];

    const edits = modify(source, path, rule, {
        formattingOptions: {
            insertSpaces: true,
            tabSize: 2,
            eol: "\n",
        },
    });

    return applyEdits(source, edits);
}