"use client";

import {type SubmitEvent, useState} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle, X} from "lucide-react";

import {NodeSchema} from "@headdeck/shared";

import {setNodeTagsAction} from "@/app/(dashboard)/nodes/actions";

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
import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";

type Props = {
    node: NodeSchema.NodeSummary;
    availableTags: string[];
    onSuccess: () => void;
};

export default function EditNodeTagsDialog({
                                       node,
                                       availableTags,
                                       onSuccess,
                                   }: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [tags, setTags] = useState<string[]>(node.tags);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const options = Array.from(
        new Set([...availableTags, ...node.tags]),
    ).sort();

    function reset() {
        setTags(node.tags);
        setError(null);
    }

    function toggleTag(tag: string, checked: boolean) {
        setTags((current) => {
            if (checked) {
                return current.includes(tag)
                    ? current
                    : [...current, tag];
            }

            return current.filter((value) => value !== tag);
        });

        setError(null);
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        const parsed = NodeSchema.SetNodeTagsSchema.safeParse({
            id: node.id,
            tags,
        });

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]?.message ??
                "Invalid node tags",
            );
            return;
        }

        const originalTags = [...node.tags].sort();
        const selectedTags = [...parsed.data.tags].sort();

        if (JSON.stringify(originalTags) === JSON.stringify(selectedTags)) {
            setOpen(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await setNodeTagsAction(parsed.data);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            onSuccess();
            router.refresh();
        } catch {
            setError("Unable to update node tags. Please try again.");
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
            <DialogTrigger render={<Button variant="outline">Edit Tags</Button>} />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Node Tags</DialogTitle>
                    <DialogDescription>
                        Select tags defined in your Headscale ACL policy
                        for {node.givenName || node.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Tags</p>

                        <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border p-2">
                            {tags.length === 0 ? (
                                <span className="text-sm text-muted-foreground">
                                    No tags selected
                                </span>
                            ) : (
                                tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => toggleTag(tag, false)}
                                            aria-label={`Remove ${tag}`}
                                            className="rounded-sm"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Available Tags</p>

                        <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-2">
                            {options.length === 0 ? (
                                <p className="p-2 text-sm text-muted-foreground">
                                    No tags defined in the ACL policy.
                                </p>
                            ) : (
                                options.map((tag) => {
                                    const selected = tags.includes(tag);
                                    const defined = availableTags.includes(tag);

                                    return (
                                        <label
                                            key={tag}
                                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                checked={selected}
                                                disabled={loading || !defined}
                                                onCheckedChange={(checked) =>
                                                    toggleTag(tag, checked === true)
                                                }
                                            />

                                            <span className="flex-1 text-sm">{tag}</span>

                                            {!defined && (
                                                <span className="text-xs text-muted-foreground">
                                                    Not in policy
                                                </span>
                                            )}
                                        </label>
                                    );
                                })
                            )}
                        </div>
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

                        <Button type="submit" disabled={loading}>
                            {loading && <LoaderCircle className="size-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}