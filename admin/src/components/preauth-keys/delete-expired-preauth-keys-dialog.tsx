"use client";

import {useState} from "react";
import {AlertTriangle, Loader2, Trash2} from "lucide-react";

import {deleteExpiredPreAuthKeysAction,} from "@/app/(dashboard)/preauth-keys/actions";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

type Props = {
    expiredCount: number;
    onComplete: (deletedIds: string[]) => void;
};

const CONFIRMATION = "DELETE EXPIRED KEYS";

export default function DeleteExpiredPreAuthKeysDialog({
                                                           expiredCount,
                                                           onComplete,
                                                       }: Props) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleOpenChange(nextOpen: boolean) {
        if (loading) return;

        setOpen(nextOpen);

        if (!nextOpen) {
            setStep(1);
            setConfirmation("");
            setError(null);
        }
    }

    async function handleDelete() {
        if (loading || confirmation !== CONFIRMATION) return;

        setLoading(true);
        setError(null);

        try {
            const result = await deleteExpiredPreAuthKeysAction(
                confirmation,
            );

            if (result.success) {
                setLoading(false);
                handleOpenChange(false);
                onComplete(result.deletedIds);
                return;
            }

            // Partial deletions must still update the table.
            if (result.deletedIds.length > 0) {
                onComplete(result.deletedIds);
            }

            setError(result.error);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete expired keys.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button
                variant="destructive"
                disabled={expiredCount === 0}
                onClick={() => handleOpenChange(true)}
            >
                <Trash2 className="size-4"/>
                Delete Expired Keys
            </Button>

            <Dialog
                open={open}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="sm:max-w-md">
                    {step === 1 ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="size-5 text-destructive"/>
                                    Delete Expired Keys?
                                </DialogTitle>

                                <DialogDescription>
                                    You are about to permanently delete
                                    expired pre-auth keys from Headscale.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-3">
                                <div className="rounded-md border p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Currently expired keys
                                    </p>

                                    <p className="mt-1 text-3xl font-semibold">
                                        {expiredCount}
                                    </p>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Active keys and used keys that have not
                                    expired will be preserved.
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    Existing registered nodes will not
                                    be deleted.
                                </p>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={() => setStep(2)}
                                >
                                    Continue
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Final Confirmation
                                </DialogTitle>

                                <DialogDescription>
                                    This action cannot be undone.
                                    Confirm that you want to permanently
                                    delete all currently expired keys.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-3">
                                <div className="space-y-2">
                                    <Label htmlFor="delete-expired-confirmation">
                                        Type <strong>{CONFIRMATION}</strong> to confirm
                                    </Label>

                                    <Input
                                        id="delete-expired-confirmation"
                                        value={confirmation}
                                        onChange={(event) =>
                                            setConfirmation(event.target.value)
                                        }
                                        placeholder={CONFIRMATION}
                                        autoComplete="off"
                                        disabled={loading}
                                    />
                                </div>

                                {error && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {error}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    onClick={() => {
                                        setStep(1);
                                        setError(null);
                                    }}
                                >
                                    Back
                                </Button>

                                <Button
                                    variant="destructive"
                                    disabled={
                                        loading ||
                                        confirmation !== CONFIRMATION
                                    }
                                    onClick={handleDelete}
                                >
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin"/>
                                    ) : (
                                        <Trash2 className="size-4"/>
                                    )}

                                    {loading
                                        ? "Deleting..."
                                        : "Delete Expired Keys"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}