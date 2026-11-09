"use client";

import {useState} from "react";
import {Pencil, Plus, Trash2} from "lucide-react";
import {PolicySchema, UserSchema} from "@headdeck/shared";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
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

import PolicyAclDialog from "./policy-acl-dialog";

type Rule = PolicySchema.PolicyACLRule;

type Props = {
    rules: Rule[];
    users: UserSchema.User[];
    groups: string[];
    tags: string[];
    onChange: (
        index: number | null,
        rule: Rule | undefined,
    ) => void;
};

export default function PolicyAclEditor({
                                            rules,
                                            users,
                                            groups,
                                            tags,
                                            onChange,
                                        }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    function add() {
        setEditing(null);
        setOpen(true);
    }

    function edit(index: number) {
        setEditing(index);
        setOpen(true);
    }

    function save(rule: Rule) {
        onChange(editing, rule);
        setOpen(false);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>Access Control Rules</CardTitle>

                <Button variant="outline" onClick={add}>
                    <Plus className="size-4"/>
                    Add ACL Rule
                </Button>
            </CardHeader>

            <CardContent className="space-y-3">
                {rules.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No ACL rules defined.
                    </p>
                )}

                {rules.map((rule, index) => (
                    <div
                        key={index}
                        className="rounded-lg border p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-3">
                                <p className="text-sm font-medium">
                                    Rule {index + 1} · {rule.action ?? "Unspecified"}
                                </p>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Sources
                                    </p>
                                    <p className="break-all font-mono text-sm">
                                        {rule.src.join(", ")}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Destinations
                                    </p>
                                    <p className="break-all font-mono text-sm">
                                        {rule.dst.join(", ")}
                                    </p>
                                </div>

                                {rule.proto && (
                                    <p className="text-xs text-muted-foreground">
                                        Protocol: {rule.proto}
                                    </p>
                                )}
                            </div>

                            <div className="flex shrink-0 gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label={`Edit rule ${index + 1}`}
                                    disabled={rule.action !== "accept"}
                                    onClick={() => edit(index)}
                                >
                                    <Pencil className="size-4"/>
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label={`Delete rule ${index + 1}`}
                                    onClick={() => setDeleting(index)}
                                >
                                    <Trash2 className="size-4 text-destructive"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>

            <PolicyAclDialog
                open={open}
                onOpenChange={setOpen}
                rule={editing === null ? null : rules[editing] ?? null}
                users={users}
                groups={groups}
                tags={tags}
                onSave={save}
            />

            <AlertDialog
                open={deleting !== null}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete ACL rule?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the rule from your local
                            draft. Nothing will be published.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleting !== null) {
                                    onChange(deleting, undefined);
                                }
                                setDeleting(null);
                            }}
                        >
                            Delete Rule
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}