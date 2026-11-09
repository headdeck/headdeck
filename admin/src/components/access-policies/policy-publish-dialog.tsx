"use client";

import {useState, useTransition} from "react";
import {AlertTriangle, Loader2, Upload} from "lucide-react";

import {publishPolicyAction} from "@/app/(dashboard)/access-policies/actions";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    originalPolicy: string;
    draft: string;
    onPublished: (
        policy: string,
        updatedAt: string | null,
    ) => void;
};

export default function PolicyPublishDialog({
                                                open,
                                                onOpenChange,
                                                originalPolicy,
                                                draft,
                                                onPublished,
                                            }: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [conflict, setConflict] = useState(false);

    function handleOpenChange(nextOpen: boolean) {
        if (pending) return;

        if (!nextOpen) {
            setError(null);
            setConflict(false);
        }

        onOpenChange(nextOpen);
    }

    function handlePublish() {
        if (pending || conflict) return;

        setError(null);

        startTransition(async () => {
            const result = await publishPolicyAction({
                originalPolicy,
                draft,
            });

            if (!result.success) {
                setError(result.error);
                setConflict(result.conflict ?? false);
                return;
            }

            onPublished(
                result.policy,
                result.updatedAt,
            );

            handleOpenChange(false);
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Publish Access Policy?
                    </DialogTitle>

                    <DialogDescription>
                        This will replace the current Headscale
                        policy with your local draft.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-md border p-4">
                        <AlertTriangle
                            className="mt-0.5 size-5 shrink-0 text-amber-500"
                        />

                        <div className="space-y-1 text-sm">
                            <p className="font-medium">
                                Network access may change immediately.
                            </p>

                            <p className="text-muted-foreground">
                                Publishing may allow or restrict
                                communication between connected nodes.
                                Review your policy before continuing.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-md border border-destructive/40 p-3 text-sm text-destructive"
                        >
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={pending}
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={pending || conflict}
                        onClick={handlePublish}
                    >
                        {pending ? (
                            <Loader2 className="size-4 animate-spin"/>
                        ) : (
                            <Upload className="size-4"/>
                        )}

                        {pending
                            ? "Publishing..."
                            : "Publish Policy"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}