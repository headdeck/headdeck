import {
    applyEdits,
    format,
    parse,
    type ParseError,
} from "jsonc-parser";

export function formatPolicyDocument(
    source: string,
): string {
    const errors: ParseError[] = [];

    parse(source, errors, {
        allowTrailingComma: true,
        disallowComments: false,
    });

    if (errors.length > 0) {
        throw new Error(
            "Fix HuJSON syntax errors before formatting.",
        );
    }

    const edits = format(source, undefined, {
        insertSpaces: true,
        tabSize: 2,
        eol: "\n",
        insertFinalNewline: true,
    });

    return applyEdits(source, edits);
}