"use client";

import {useMemo, useState} from "react";
import {CheckCircle2, Code2, FileJson, RotateCcw, Save, ShieldCheck, TriangleAlert,} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";

const initialPolicy = JSON.stringify(
    {
        groups: {
            "group:admins": ["admin"],
            "group:developers": ["developer"],
        },
        tagOwners: {
            "tag:server": ["group:admins"],
            "tag:development": ["group:developers"],
        },
        acls: [
            {
                action: "accept",
                src: ["group:admins"],
                dst: ["*:*"],
            },
            {
                action: "accept",
                src: ["group:developers"],
                dst: ["tag:development:*"],
            },
        ],
    },
    null,
    2,
);

type SyntaxResult =
    | { valid: true; message: string }
    | { valid: false; message: string };

function checkSyntax(value: string): SyntaxResult {
    try {
        const parsed: unknown = JSON.parse(value);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return {
                valid: false,
                message: "The policy must be a JSON object.",
            };
        }

        return {
            valid: true,
            message: "Valid JSON syntax.",
        };
    } catch (error) {
        return {
            valid: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Invalid JSON syntax.",
        };
    }
}

export default function AccessPoliciesPage() {
    const [draft, setDraft] = useState(initialPolicy);
    const [showPreview, setShowPreview] = useState(false);

    const syntax = useMemo(() => checkSyntax(draft), [draft]);
    const changed = draft !== initialPolicy;

    const formatted = useMemo(() => {
        if (!syntax.valid) return null;

        return JSON.stringify(JSON.parse(draft), null, 2);
    }, [draft, syntax.valid]);

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Access Policies
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View and manage network access control policies.
                    </p>
                </div>

                <Badge variant="outline">Preview Data</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Policy Format
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                                JSON
                            </p>
                        </div>
                        <FileJson className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Draft Status
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                                {changed ? "Modified" : "Unchanged"}
                            </p>
                        </div>
                        <Code2 className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                JSON Syntax
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                                {syntax.valid ? "Valid" : "Invalid"}
                            </p>
                        </div>
                        <ShieldCheck className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                    <div>
                        <CardTitle>Policy Editor</CardTitle>
                        <CardDescription className="mt-1">
                            Edit the preview policy document.
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDraft(initialPolicy)}
                            disabled={!changed}
                        >
                            <RotateCcw className="size-4"/>
                            Reset Draft
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => {
                                if (formatted !== null) {
                                    setDraft(formatted);
                                }
                            }}
                            disabled={!syntax.valid}
                        >
                            <Code2 className="size-4"/>
                            Format JSON
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        spellCheck={false}
                        aria-label="Policy JSON editor"
                        className="min-h-[420px] resize-y font-mono text-sm leading-6"
                    />

                    <div
                        className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                            syntax.valid
                                ? "border-emerald-500/20"
                                : "border-destructive/30"
                        }`}
                    >
                        {syntax.valid ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500"/>
                        ) : (
                            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive"/>
                        )}

                        <div>
                            <p className="font-medium">
                                {syntax.message}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                JSON syntax checking does not validate Headscale
                                policy rules or network permissions.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Changes are local to this page and are not saved.
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(true)}
                                disabled={!syntax.valid}
                            >
                                Review Draft
                            </Button>

                            <Button disabled>
                                <ShieldCheck className="size-4"/>
                                Check with Headscale
                            </Button>

                            <Button disabled>
                                <Save className="size-4"/>
                                Publish Policy
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Publishing Safeguards</CardTitle>
                    <CardDescription>
                        Planned protections for live policy changes.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        HeadDeck will retrieve the current policy before editing.
                    </p>
                    <p>
                        Drafts will be checked using Headscale before publishing.
                    </p>
                    <p>
                        Publishing will require explicit confirmation.
                    </p>
                    <p>
                        The previous policy can be kept in the browser during
                        the editing session for manual recovery.
                    </p>
                </CardContent>
            </Card>

            {showPreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowPreview(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="policy-preview-title"
                        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border bg-background shadow-xl"
                    >
                        <div className="border-b p-5">
                            <h3
                                id="policy-preview-title"
                                className="text-lg font-semibold"
                            >
                                Review Policy Draft
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                This preview is not a Headscale validation result.
                            </p>
                        </div>

                        <pre className="min-h-0 flex-1 overflow-auto p-5 font-mono text-xs leading-5">
              {formatted}
            </pre>

                        <div className="flex justify-end border-t p-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}