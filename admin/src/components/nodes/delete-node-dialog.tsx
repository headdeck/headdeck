"use client";

import {type SubmitEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle, Trash2} from "lucide-react";

import {NodeSchema} from "@headdeck/shared";

import {deleteNodeAction} from "@/app/(dashboard)/nodes/actions";

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

export default function DeleteNodeDialog({
                                             node,
                                             onSuccess,
                                         }: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nodeName = node.givenName || node.name;
    const confirmed = confirmation === nodeName;

    function reset() {
        setConfirmation("");
        setError(null);
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading || !confirmed) return;

        const parsed = NodeSchema.DeleteNodeSchema.safeParse({
            id: node.id,
        });

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]?.message ?? "Invalid node ID",
            );
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await deleteNodeAction(parsed.data);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            onSuccess();
            router.refresh();
        } catch {
            setError("Unable to delete node. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (loading) return;

                if (nextOpen) reset();
                setOpen(nextOpen);
            }}
        >
            <DialogTrigger
                render={
                    <Button variant="destructive">
                        <Trash2 className="size-4"/>
                        Delete Node
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Node</DialogTitle>
                    <DialogDescription>
                        This action will permanently remove the node
                        registration from Headscale.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                        <p className="text-sm font-medium text-destructive">
                            This action cannot be undone.
                        </p>

                        <p className="text-sm text-muted-foreground">
                            The node will be removed from your tailnet.
                            To connect this device again, it must
                            register with Headscale again.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delete-node-confirmation">
                            Type{" "}
                            <span className="font-semibold">
                                {nodeName}
                            </span>{" "}
                            to confirm
                        </Label>

                        <Input
                            id="delete-node-confirmation"
                            value={confirmation}
                            onChange={(event) => {
                                setConfirmation(event.target.value);
                                setError(null);
                            }}
                            placeholder={nodeName}
                            autoComplete="off"
                            disabled={loading}
                            required
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
                            {loading ? (
                                <LoaderCircle className="size-4 animate-spin"/>
                            ) : (
                                <Trash2 className="size-4"/>
                            )}
                            Delete Node
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}