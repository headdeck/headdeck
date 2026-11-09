"use client";

import {type SubmitEvent, useState} from "react";
import {Check, Copy, KeyRound, Loader2, Plus} from "lucide-react";
import {useRouter} from "next/navigation";

import {UserSchema} from "@headdeck/shared";

import {createPreAuthKeyAction} from "@/app/(dashboard)/preauth-keys/actions";

import {Badge} from "@/components/ui/badge";
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: UserSchema.User[];
    availableTags: string[];
};

export default function CreatePreAuthKeyDialog({
                                                   open,
                                                   onOpenChange,
                                                   users,
                                                   availableTags,
                                               }: Props) {
    const router = useRouter();

    const [user, setUser] = useState("");
    const [expirationHours, setExpirationHours] = useState("24");
    const [reusable, setReusable] = useState(false);
    const [ephemeral, setEphemeral] = useState(false);
    const [tags, setTags] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    function reset() {
        setUser("");
        setExpirationHours("24");
        setReusable(false);
        setEphemeral(false);
        setTags([]);
        setError(null);
        setGeneratedKey(null);
        setCopied(false);
    }

    function handleOpenChange(nextOpen: boolean) {
        if (loading) return;

        if (!nextOpen) {
            reset();
        }

        onOpenChange(nextOpen);
    }

    function toggleTag(tag: string) {
        setTags((current) =>
            current.includes(tag)
                ? current.filter((value) => value !== tag)
                : [...current, tag],
        );
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        setError(null);

        const hours = Number(expirationHours);

        if (!Number.isFinite(hours) || hours <= 0) {
            setError("Enter a valid expiration duration.");
            return;
        }

        if (!users.some((item) => item.id === user)) {
            setError("Select a valid Headscale user.");
            return;
        }

        const expiration = new Date(
            Date.now() + hours * 60 * 60 * 1000,
        );

        if (Number.isNaN(expiration.getTime())) {
            setError("Invalid expiration duration.");
            return;
        }

        setLoading(true);

        try {
            const result = await createPreAuthKeyAction({
                user,
                reusable,
                ephemeral,
                expiration: expiration.toISOString(),
                aclTags: tags,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setGeneratedKey(result.key);
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create pre-auth key.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function copyKey() {
        if (!generatedKey) return;

        try {
            await navigator.clipboard.writeText(generatedKey);
            setCopied(true);
        } catch {
            setError("Unable to copy the key. Copy it manually.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                {generatedKey ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Check className="size-5 text-emerald-500"/>
                                Pre-auth Key Created
                            </DialogTitle>

                            <DialogDescription>
                                Your registration key was generated successfully.
                                Copy it now to register your node.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Generated Key</Label>

                                <div className="rounded-md border bg-muted/40 p-3">
                                    <code className="block break-all font-mono text-sm select-all">
                                        {generatedKey}
                                    </code>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    The full key may not be available again.
                                    Headscale masks keys in subsequent list responses.
                                </p>
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
                                onClick={() => handleOpenChange(false)}
                            >
                                Done
                            </Button>

                            <Button onClick={copyKey}>
                                {copied ? (
                                    <Check className="size-4"/>
                                ) : (
                                    <Copy className="size-4"/>
                                )}
                                {copied ? "Copied" : "Copy Key"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <KeyRound className="size-5"/>
                                Create Pre-auth Key
                            </DialogTitle>

                            <DialogDescription>
                                Generate a registration key for a Headscale node.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-5">
                            <div className="space-y-2">
                                <Label htmlFor="preauth-user">
                                    User
                                </Label>

                                <select
                                    id="preauth-user"
                                    value={user}
                                    onChange={(event) => setUser(event.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">Select a user</option>

                                    {users.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preauth-expiration">
                                    Expiration (hours)
                                </Label>

                                <Input
                                    id="preauth-expiration"
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    disabled={loading}
                                    value={expirationHours}
                                    onChange={(event) =>
                                        setExpirationHours(event.target.value)
                                    }
                                />

                                <p className="text-xs text-muted-foreground">
                                    The key will expire after this duration.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={reusable}
                                        disabled={loading}
                                        onChange={(event) =>
                                            setReusable(event.target.checked)
                                        }
                                        className="mt-1 size-4 accent-primary"
                                    />

                                    <span>
                                        <span className="block text-sm font-medium">
                                            Reusable Key
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Allow multiple node registrations.
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={ephemeral}
                                        disabled={loading}
                                        onChange={(event) =>
                                            setEphemeral(event.target.checked)
                                        }
                                        className="mt-1 size-4 accent-primary"
                                    />

                                    <span>
                                        <span className="block text-sm font-medium">
                                            Ephemeral Nodes
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Nodes registered with this key are ephemeral.
                                        </span>
                                    </span>
                                </label>
                            </div>

                            <div className="space-y-3">
                                <Label>ACL Tags (optional)</Label>

                                {availableTags.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No tags defined in the current ACL policy.
                                    </p>
                                ) : (
                                    <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                                        {availableTags.map((tag) => (
                                            <label
                                                key={tag}
                                                className="flex cursor-pointer items-center gap-3"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={tags.includes(tag)}
                                                    disabled={loading}
                                                    onChange={() => toggleTag(tag)}
                                                    className="size-4 accent-primary"
                                                />

                                                <span className="font-mono text-sm">
                                                    {tag}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p role="alert" className="text-sm text-destructive">
                                    {error}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading || users.length === 0}
                            >
                                {loading ? (
                                    <Loader2 className="size-4 animate-spin"/>
                                ) : (
                                    <Plus className="size-4"/>
                                )}

                                {loading ? "Generating..." : "Generate Key"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}