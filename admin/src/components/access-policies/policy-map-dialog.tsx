"use client";

import {useEffect, useState} from "react";
import type {UserSchema} from "@headdeck/shared";

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

import PolicyMemberSelector from "./policy-member-selector";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    prefix: "group:" | "tag:";
    entries: Record<string, string[]>;
    editing: string | null;
    users: UserSchema.User[];
    groups: string[];
    allowGroups: boolean;
    onSave: (name: string, members: string[]) => void;
};

export default function PolicyMapDialog({
                                            open,
                                            onOpenChange,
                                            title,
                                            prefix,
                                            entries,
                                            editing,
                                            users,
                                            groups,
                                            allowGroups,
                                            onSave,
                                        }: Props) {
    const [name, setName] = useState("");
    const [members, setMembers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setName(editing ?? "");
        setMembers(editing ? [...(entries[editing] ?? [])] : []);
        setError(null);
    }, [open, editing, entries]);

    function save() {
        const normalizedName = name.trim();

        if (
            !normalizedName.startsWith(prefix) ||
            normalizedName.length <= prefix.length
        ) {
            setError(`Name must start with ${prefix}`);
            return;
        }

        if (
            editing === null &&
            Object.hasOwn(entries, normalizedName)
        ) {
            setError("This entry already exists.");
            return;
        }

        if (members.length === 0) {
            setError("Select at least one principal.");
            return;
        }

        if (editing !== null && normalizedName !== editing) {
            setError("Renaming entries is not supported yet.");
            return;
        }

        onSave(normalizedName, members);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? `Edit ${title}` : `Add ${title}`}
                    </DialogTitle>
                    <DialogDescription>
                        Select the principals associated with this entry.
                        Changes remain in your local draft.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <Input
                        value={name}
                        disabled={editing !== null}
                        placeholder={`${prefix}example`}
                        onChange={(event) => {
                            setName(event.target.value);
                            setError(null);
                        }}
                    />

                    <PolicyMemberSelector
                        users={users}
                        groups={groups}
                        allowGroups={allowGroups}
                        value={members}
                        onChange={setMembers}
                    />

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button onClick={save}>
                        {editing ? "Save Changes" : "Add Entry"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}