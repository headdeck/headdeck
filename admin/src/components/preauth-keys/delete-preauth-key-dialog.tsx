"use client";

import {useState} from "react";
import {Loader2, Trash2} from "lucide-react";

import {PreAuthKeySchema} from "@headdeck/shared";

import {deletePreAuthKeyAction} from "@/app/(dashboard)/preauth-keys/actions";

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
    keyData: PreAuthKeySchema.PreAuthKey;
    onSuccess: (deletedKeyId: string) => void;
};

export default function DeletePreAuthKeyDialog({
                                                   keyData,
                                                   onSuccess,
                                               }: Props) {
    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmed = confirmation === keyData.id;

    function handleOpenChange(nextOpen: boolean) {
        if (loading) return;

        if (!nextOpen) {
            setConfirmation("");
            setError(null);
        }

        setOpen(nextOpen);
    }

    async function handleDelete() {
        if (loading || !confirmed) return;

        setLoading(true);
        setError(null);

        try {
            const result = await deletePreAuthKeyAction({
                id: keyData.id,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            onSuccess(keyData.id);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete pre-auth key.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleOpenChange(true)}
            >
                <Trash2 className="size-4"/>
                Delete Key
            </Button>

            <Dialog
                open={open}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Delete Pre-auth Key?
                        </DialogTitle>

                        <DialogDescription>
                            This will permanently delete pre-auth key
                            #{keyData.id} from Headscale.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="rounded-md border p-3">
                            <p className="text-sm text-muted-foreground">
                                Key
                            </p>

                            <p className="mt-1 break-all font-mono text-sm">
                                {keyData.key}
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Deleted keys can no longer be used for node
                            registration. Existing registered nodes
                            will not be removed.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="delete-preauth-confirmation">
                                Type <strong>{keyData.id}</strong> to confirm
                            </Label>

                            <Input
                                id="delete-preauth-confirmation"
                                value={confirmation}
                                onChange={(event) =>
                                    setConfirmation(event.target.value)
                                }
                                placeholder={keyData.id}
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
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={!confirmed || loading}
                            onClick={handleDelete}
                        >
                            {loading ? (
                                <Loader2 className="size-4 animate-spin"/>
                            ) : (
                                <Trash2 className="size-4"/>
                            )}

                            {loading ? "Deleting..." : "Delete Key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}