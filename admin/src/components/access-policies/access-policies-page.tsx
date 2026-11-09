"use client";

import {useMemo, useState} from "react";
import {CheckCircle2, RotateCcw, Save, TriangleAlert,} from "lucide-react";

import {parsePolicyDocument, UserSchema,} from "@headdeck/shared";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";

import PolicyOverview from "./policy-overview";
import PolicyDocumentEditor from "./policy-document-editor";
import PolicyPublishDialog from "./policy-publish-dialog";

type User = UserSchema.User;

type Props = {
    initialPolicy: string;
    updatedAt: string | null;
    users: User[];
};

type ValidationResult =
    | { valid: true }
    | { valid: false; error: string };

export default function AccessPoliciesPage({
                                               initialPolicy,
                                               updatedAt,
                                               users,
                                           }: Props) {
    const [livePolicy, setLivePolicy] = useState(initialPolicy);
    const [liveUpdatedAt, setLiveUpdatedAt] = useState(updatedAt);

    const [draft, setDraft] = useState(initialPolicy);
    const [publishOpen, setPublishOpen] = useState(false);

    const changed = draft !== livePolicy;

    const validation = useMemo<ValidationResult>(() => {
        try {
            parsePolicyDocument(draft);

            return {valid: true};
        } catch (error) {
            return {
                valid: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Invalid policy document",
            };
        }
    }, [draft]);

    function resetDraft() {
        setDraft(livePolicy);
    }

    function handlePublished(
        policy: string,
        newUpdatedAt: string | null,
    ) {
        setLivePolicy(policy);
        setLiveUpdatedAt(newUpdatedAt);
        setDraft(policy);
        setPublishOpen(false);
    }

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Access Policies
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        View and manage Headscale network access policies.
                    </p>
                </div>

                <Badge variant="outline">
                    Live Policy
                </Badge>
            </div>

            <PolicyOverview
                valid={validation.valid}
                changed={changed}
                updatedAt={liveUpdatedAt}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Policy Editor</CardTitle>

                    <CardDescription>
                        Edit the current Headscale policy document.
                        Changes remain local until published.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <PolicyDocumentEditor
                        value={draft}
                        onChange={setDraft}
                        users={users}
                    />

                    <div className="flex items-start gap-2 rounded-md border p-3 text-sm">
                        {validation.valid ? (
                            <CheckCircle2
                                className="mt-0.5 size-4 shrink-0 text-emerald-500"
                            />
                        ) : (
                            <TriangleAlert
                                className="mt-0.5 size-4 shrink-0 text-destructive"
                            />
                        )}

                        <div>
                            <p className="font-medium">
                                {validation.valid
                                    ? "Policy document parsed successfully."
                                    : validation.error}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Local validation does not guarantee
                                that Headscale will accept these rules.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <Button
                            variant="outline"
                            disabled={!changed}
                            onClick={resetDraft}
                        >
                            <RotateCcw className="size-4"/>
                            Reset Draft
                        </Button>

                        <Button
                            disabled={!changed || !validation.valid}
                            onClick={() => setPublishOpen(true)}
                        >
                            <Save className="size-4"/>
                            Publish Policy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <PolicyPublishDialog
                open={publishOpen}
                onOpenChange={setPublishOpen}
                originalPolicy={livePolicy}
                draft={draft}
                onPublished={handlePublished}
            />
        </div>
    );
}