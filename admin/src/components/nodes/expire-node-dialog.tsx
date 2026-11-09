"use client";

import {type SubmitEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle} from "lucide-react";

import {NodeSchema} from "@headdeck/shared";

import {expireNodeAction} from "@/app/(dashboard)/nodes/actions";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

type Props = {
    node: NodeSchema.NodeSummary;
    onSuccess: () => void;
};

export default function ExpireNodeDialog({node, onSuccess}: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nodeName = node.givenName || node.name;
    const confirmed = confirmation === nodeName;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading || !confirmed) return;

        setLoading(true);
        setError(null);

        try {
            const result = await expireNodeAction({id: node.id});

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            onSuccess();
            router.refresh();
        } catch {
            setError("Unable to expire node. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (loading) return;

                setOpen(nextOpen);
                setConfirmation("");
                setError(null);
            }}
        >
            <DialogTrigger
                render={
                    <Button variant="outline">
                        Expire Node
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Expire Node</DialogTitle>
                    <DialogDescription>
                        Expire the registration of{" "}
                        <strong>{nodeName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-md border p-4 text-sm">
                        <p className="font-medium">
                            This node will need to authenticate again.
                        </p>

                        <p className="mt-2 text-muted-foreground">
                            Expiration invalidates the current node
                            registration and may interrupt its connectivity.
                            The node record is not deleted from Headscale.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expire-node-confirmation">
                            Type <strong>{nodeName}</strong> to confirm
                        </Label>

                        <Input
                            id="expire-node-confirmation"
                            value={confirmation}
                            onChange={(event) => {
                                setConfirmation(event.target.value);
                                setError(null);
                            }}
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading || !confirmed}
                        >
                            {loading && (
                                <LoaderCircle className="size-4 animate-spin"/>
                            )}
                            Expire Node
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}