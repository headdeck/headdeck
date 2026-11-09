import {parse, printParseErrorCode, type ParseError} from "jsonc-parser";

import {
    AvailablePolicyTagsSchema,
    PolicyDocumentSchema,
    type PolicyDocument,
    type AvailablePolicyTags,
} from "@/schemas/policy.schema.js";

export function parsePolicyDocument(source: string): PolicyDocument {
    const errors: ParseError[] = [];

    const value: unknown = parse(source, errors, {
        allowTrailingComma: true,
        disallowComments: false,
    });

    if (errors.length > 0) {
        const error = errors[0];

        if (!error) {
            throw new Error("Invalid policy document: unknown error");
        }

        throw new Error(
            `Invalid policy document: ${printParseErrorCode(error.error)} at offset ${error.offset}`,
        );
    }

    return PolicyDocumentSchema.parse(value);
}

export function getAvailablePolicyTags(
    policy: PolicyDocument,
): AvailablePolicyTags {
    const tags = Object.keys(policy.tagOwners ?? {}).sort();

    return AvailablePolicyTagsSchema.parse(tags);
}