"use client";

import {useState} from "react";
import {Clock3, Loader2} from "lucide-react";

import {PreAuthKeySchema} from "@headdeck/shared";

import {expirePreAuthKeyAction} from "@/app/(dashboard)/preauth-keys/actions";

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
    keyData: PreAuthKeySchema.PreAuthKey;
    onSuccess: (expiredKeyId: string) => void;
};

export default function ExpirePreAuthKeyDialog({
                                                   keyData,
                                                   onSuccess,
                                               }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExpire() {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const result = await expirePreAuthKeyAction({
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
                    : "Failed to expire pre-auth key.",
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
                onClick={() => setOpen(true)}
            >
                <Clock3 className="size-4"/>
                Expire Key
            </Button>

            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (loading) return;

                    if (!nextOpen) setError(null);

                    setOpen(nextOpen);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Expire Pre-auth Key?
                        </DialogTitle>

                        <DialogDescription>
                            This will immediately invalidate pre-auth key
                            #{keyData.id} for future node registrations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-sm">
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground">
                                Key
                            </p>

                            <p className="mt-1 break-all font-mono">
                                {keyData.key}
                            </p>
                        </div>

                        <p className="text-muted-foreground">
                            Existing nodes registered with this key will
                            not be disconnected.
                        </p>

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
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={loading}
                            onClick={handleExpire}
                        >
                            {loading && (
                                <Loader2 className="size-4 animate-spin"/>
                            )}

                            {loading ? "Expiring..." : "Expire Key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}