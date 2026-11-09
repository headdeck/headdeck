"use client";

import {type SubmitEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle, Plus} from "lucide-react";

import {UserSchema} from "@headdeck/shared";

import {createUserAction} from "@/app/(dashboard)/users/actions";
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

export default function CreateUserDialog() {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        const parsed = UserSchema.CreateUserSchema.safeParse({name});

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid username");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await createUserAction(parsed.data);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            setName("");
            router.refresh();
        } catch {
            setError("Unable to create user. Please try again.");
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
                if (!nextOpen) {
                    setName("");
                    setError(null);
                }
            }}
        >
            <DialogTrigger
                render={
                    <Button>
                        <Plus className="size-4"/>
                        Create User
                    </Button>
                }/>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                        Create a new user in your Headscale instance.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="new-user-name">
                            Username
                        </Label>

                        <Input
                            id="new-user-name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setError(null);
                            }}
                            placeholder="e.g. development"
                            autoComplete="off"
                            disabled={loading}
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

                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading && (
                                <LoaderCircle className="size-4 animate-spin"/>
                            )}
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}