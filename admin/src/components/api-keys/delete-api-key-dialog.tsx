"use client";

import {useState, useTransition} from "react";
import {Trash2} from "lucide-react";
import {deleteApiKeyAction} from "@/app/(dashboard)/api-keys/actions";
import type {ApiKey} from "./api-key-utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
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

export default function DeleteApiKeyDialog({
                                               apiKey,
                                               onClose,
                                               onSuccess,
                                           }: Props) {
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function close() {
        if (pending) return;
        setConfirmation("");
        setError(null);
        onClose();
    }

    function remove() {
        if (!apiKey || pending || confirmation !== apiKey.id) return;

        setError(null);

        startTransition(async () => {
            const result = await deleteApiKeyAction({
                prefix: apiKey.prefix,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setConfirmation("");
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
                    <DialogTitle>Delete API Key</DialogTitle>
                    <DialogDescription>
                        Permanently remove this API key from
                        Headscale. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-md border p-3">
                        <p className="break-all font-mono text-sm">
                            {apiKey?.prefix}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Key ID: {apiKey?.id}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="delete-api-key-confirmation"
                            className="text-sm font-medium"
                        >
                            Type <span className="font-mono">
                                {apiKey?.id}
                            </span> to confirm
                        </label>
                        <Input
                            id="delete-api-key-confirmation"
                            value={confirmation}
                            disabled={pending}
                            onChange={(event) =>
                                setConfirmation(event.target.value)
                            }
                            autoComplete="off"
                        />
                    </div>

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
                        disabled={pending || confirmation !== apiKey?.id}
                        onClick={remove}
                    >
                        <Trash2 className="size-4"/>
                        {pending ? "Deleting..." : "Delete API Key"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}