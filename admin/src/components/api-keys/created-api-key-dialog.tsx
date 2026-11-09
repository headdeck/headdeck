"use client";

import {useState} from "react";
import {Check, Copy} from "lucide-react";
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
    secret: string | null;
    onClose: () => void;
};

export default function CreatedApiKeyDialog({
                                                secret,
                                                onClose,
                                            }: Props) {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);

    function close() {
        setCopied(false);
        setCopyError(false);
        onClose();
    }

    async function copy() {
        if (!secret) return;

        try {
            await navigator.clipboard.writeText(secret);
            setCopied(true);
            setCopyError(false);
        } catch {
            setCopyError(true);
        }
    }

    return (
        <Dialog
            open={secret !== null}
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>API Key Created</DialogTitle>
                    <DialogDescription>
                        Copy and store your API key securely.
                        Headscale will not show the complete
                        secret again.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-md border p-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Generated API Key
                        </p>
                        <code className="block break-all font-mono text-sm">
                            {secret}
                        </code>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={copy}
                    >
                        {copied ? (
                            <>
                                <Check className="size-4"/>
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="size-4"/>
                                Copy API Key
                            </>
                        )}
                    </Button>

                    {copyError && (
                        <p role="alert" className="text-sm text-destructive">
                            Could not copy automatically.
                            Select and copy the key manually.
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Once this dialog is closed, the
                        complete secret cannot be retrieved.
                    </p>
                </div>

                <DialogFooter>
                    <Button onClick={close}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}