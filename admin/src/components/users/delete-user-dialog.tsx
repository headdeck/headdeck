"use client";

import {type SubmitEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle} from "lucide-react";

import {UserSchema} from "@headdeck/shared";

import {deleteUserAction} from "@/app/(dashboard)/users/actions";
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
    user: UserSchema.User;
    nodeCount: number;
    onSuccess: () => void;
};

export default function DeleteUserDialog({
                                             user,
                                             nodeCount,
                                             onSuccess,
                                         }: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasNodes = nodeCount > 0;
    const confirmed = confirmation === user.name;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading || hasNodes || !confirmed) return;

        setLoading(true);
        setError(null);

        try {
            const result = await deleteUserAction({id: user.id});

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            onSuccess();
            router.refresh();
        } catch {
            setError("Unable to delete user. Please try again.");
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
                    <Button variant="destructive">
                        Delete User
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Permanently delete the Headscale user{" "}
                        <strong>{user.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {hasNodes ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                            <p className="font-medium text-destructive">
                                This user cannot be deleted yet.
                            </p>

                            <p className="mt-2 text-muted-foreground">
                                The user currently owns {nodeCount} registered{" "}
                                {nodeCount === 1 ? "node" : "nodes"}.
                                Remove or transfer those nodes before deleting
                                this user.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">
                                This action is permanent. The user will be
                                removed from Headscale.
                            </p>

                            <div className="space-y-2">
                                <Label htmlFor="delete-user-confirmation">
                                    Type <strong>{user.name}</strong> to confirm
                                </Label>

                                <Input
                                    id="delete-user-confirmation"
                                    value={confirmation}
                                    onChange={(event) => {
                                        setConfirmation(event.target.value);
                                        setError(null);
                                    }}
                                    autoComplete="off"
                                    disabled={loading}
                                />
                            </div>
                        </>
                    )}

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

                        {!hasNodes && (
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={loading || !confirmed}
                            >
                                {loading && (
                                    <LoaderCircle className="size-4 animate-spin"/>
                                )}
                                Delete User
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}