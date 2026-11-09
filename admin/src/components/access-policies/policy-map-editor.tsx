"use client";

import {useState} from "react";
import {Pencil, Plus, Trash2} from "lucide-react";
import type {UserSchema} from "@headdeck/shared";

import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import PolicyMapDialog from "./policy-map-dialog";

type Props = {
    title: string;
    prefix: "group:" | "tag:";
    entries: Record<string, string[]>;
    users: UserSchema.User[];
    groups?: string[];
    allowGroups?: boolean;
    onChange: (
        name: string,
        members: string[] | undefined,
    ) => void;
    getDeleteWarnings?: (name: string) => string[];
};

export default function PolicyMapEditor({
                                            title,
                                            prefix,
                                            entries,
                                            users,
                                            groups = [],
                                            allowGroups = false,
                                            onChange,
                                            getDeleteWarnings,
                                        }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const warnings = deleting
        ? getDeleteWarnings?.(deleting) ?? []
        : [];

    function openAdd() {
        setEditing(null);
        setDialogOpen(true);
    }

    function openEdit(name: string) {
        setEditing(name);
        setDialogOpen(true);
    }

    function save(name: string, members: string[]) {
        onChange(name, members);
        setDialogOpen(false);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>{title}</CardTitle>

                <Button
                    variant="outline"
                    onClick={openAdd}
                >
                    <Plus className="size-4"/>
                    Add {prefix === "group:" ? "Group" : "Tag Owner"}
                </Button>
            </CardHeader>

            <CardContent className="space-y-3">
                {Object.entries(entries).map(([name, members]) => (
                    <div
                        key={name}
                        className="rounded-lg border p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-2">
                                <p className="break-all font-mono text-sm font-medium">
                                    {name}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {members.map((member) => (
                                        <span
                                            key={member}
                                            className="rounded-md bg-muted px-2 py-1 font-mono text-xs"
                                        >
                                            {member}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label={`Edit ${name}`}
                                    onClick={() => openEdit(name)}
                                >
                                    <Pencil className="size-4"/>
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label={`Delete ${name}`}
                                    onClick={() => setDeleting(name)}
                                >
                                    <Trash2 className="size-4 text-destructive"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {Object.keys(entries).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No entries defined.
                    </p>
                )}
            </CardContent>

            <PolicyMapDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={prefix === "group:" ? "Group" : "Tag Owner"}
                prefix={prefix}
                entries={entries}
                editing={editing}
                users={users}
                groups={groups}
                allowGroups={allowGroups}
                onSave={save}
            />

            <AlertDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {deleting}?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This removes the definition from your
                            local policy draft.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {warnings.length > 0 && (
                        <div className="space-y-2 rounded-md border border-destructive/30 p-3">
                            <p className="text-sm font-medium text-destructive">
                                This group is referenced elsewhere:
                            </p>

                            {warnings.map((warning) => (
                                <p
                                    key={warning}
                                    className="break-all font-mono text-xs"
                                >
                                    {warning}
                                </p>
                            ))}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={warnings.length > 0}
                            onClick={() => {
                                if (deleting) {
                                    onChange(deleting, undefined);
                                }
                                setDeleting(null);
                            }}
                        >
                            Delete Entry
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}