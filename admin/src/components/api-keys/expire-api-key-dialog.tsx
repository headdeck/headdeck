"use client";

import {useState, useTransition} from "react";
import {Clock3} from "lucide-react";
import {expireApiKeyAction} from "@/app/(dashboard)/api-keys/actions";
import type {ApiKey} from "./api-key-utils";
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
    apiKey: ApiKey | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function ExpireApiKeyDialog({
                                               apiKey,
                                               onClose,
                                               onSuccess,
                                           }: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (pending) return;
        setError(null);
        onClose();
    }

    function expire() {
        if (!apiKey || pending) return;

        setError(null);

        startTransition(async () => {
            const result = await expireApiKeyAction({
                prefix: apiKey.prefix,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setError(null);
            onSuccess();
        });
    }

    return (
        <Dialog
            open={apiKey !== null}
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Expire API Key</DialogTitle>
                    <DialogDescription>
                        This immediately revokes the key.
                        Applications using it will lose API access.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <p className="break-all font-mono text-sm">
                        {apiKey?.prefix}
                    </p>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={pending}
                        onClick={close}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={pending}
                        onClick={expire}
                    >
                        <Clock3 className="size-4"/>
                        {pending ? "Expiring..." : "Expire API Key"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}