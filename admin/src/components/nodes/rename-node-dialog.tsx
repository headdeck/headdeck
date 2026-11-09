"use client";

import {type SubmitEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle} from "lucide-react";

import {NodeSchema} from "@headdeck/shared";

import {renameNodeAction} from "@/app/(dashboard)/nodes/actions";
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

export default function RenameNodeDialog({node, onSuccess}: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState(node.givenName || node.name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        const parsed = NodeSchema.RenameNodeSchema.safeParse({
            id: node.id,
            newName: name,
        });

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid node name");
            return;
        }

        if (parsed.data.newName === (node.givenName || node.name)) {
            setOpen(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await renameNodeAction(parsed.data);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            onSuccess();
            router.refresh();
        } catch {
            setError("Unable to rename node. Please try again.");
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
                setError(null);

                if (nextOpen) {
                    setName(node.givenName || node.name);
                }
            }}
        >
            <DialogTrigger
                render={
                    <Button variant="outline">
                        Rename
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Node</DialogTitle>
                    <DialogDescription>
                        Change the display name for {node.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="rename-node-name">
                            Node Name
                        </Label>

                        <Input
                            id="rename-node-name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setError(null);
                            }}
                            disabled={loading}
                            autoComplete="off"
                            autoFocus
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
                            disabled={
                                loading ||
                                !name.trim() ||
                                name.trim() === (node.givenName || node.name)
                            }
                        >
                            {loading && (
                                <LoaderCircle className="size-4 animate-spin"/>
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}