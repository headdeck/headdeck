"use client";

import {useEffect, useState} from "react";
import {
    PolicySchema,
    UserSchema,
    validateAclRule,
    isAclIcmpProtocol,
} from "@headdeck/shared";

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
import PolicyAclDestinationSelector from "./policy-acl-destination-selector";
import PolicyAclProtocolSelector from "./policy-acl-protocol-selector";

type Rule = PolicySchema.PolicyACLRule;
type User = UserSchema.User;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rule: Rule | null;
    users: User[];
    groups: string[];
    tags: string[];
    onSave: (rule: Rule) => void;
};

function splitValues(value: string): string[] {
    return [...new Set(
        value.split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
    )];
}

export default function PolicyAclDialog({
                                            open,
                                            onOpenChange,
                                            rule,
                                            users,
                                            groups,
                                            tags,
                                            onSave,
                                        }: Props) {
    const [sources, setSources] = useState<string[]>([]);
    const [extraSources, setExtraSources] = useState("");
    const [destinations, setDestinations] = useState<string[]>([]);
    const [protocol, setProtocol] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setSources(rule?.src ?? []);
        setExtraSources("");
        setDestinations([...(rule?.dst ?? [])]);
        setProtocol(rule?.proto ?? "");
        setError(null);
    }, [open, rule]);

    function save() {
        const src = [
            ...new Set([
                ...sources,
                ...splitValues(extraSources),
            ]),
        ];
        const dst = destinations;

        if (src.length === 0 || dst.length === 0) {
            setError("Select a source and specify a destination.");
            return;
        }

        // Keep fields the visual editor does not manage.
        const next: Rule = {
            ...rule,
            action: "accept",
            src,
            dst,
        };

        if (protocol.trim()) {
            next.proto = protocol.trim();
        } else {
            delete next.proto;
        }

        const parsed =
            PolicySchema.PolicyACLRuleSchema.safeParse(next);

        if (!parsed.success) {
            setError("Invalid ACL rule");
            return;
        }

        const validation = validateAclRule(parsed.data);

        if (!validation.valid) {
            setError(
                validation.errors
                    .map((item) => item.message)
                    .join("\n"),
            );
            return;
        }

        onSave(parsed.data);
    }

    const previewRule = {
        action: "accept" as const,
        src: sources,
        dst: destinations,
        ...(protocol.trim() ? {proto: protocol.trim()} : {}),
    };

    const warnings = validateAclRule(previewRule).warnings;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {rule ? "Edit ACL Rule" : "Add ACL Rule"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure an allow rule. Changes remain
                        in the local policy draft.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Sources
                        </p>

                        <PolicyMemberSelector
                            users={users}
                            groups={groups}
                            allowGroups
                            value={sources}
                            onChange={setSources}
                        />

                        <p className="text-xs text-muted-foreground">
                            Additional source principals,
                            one per line.
                        </p>

                        <textarea
                            value={extraSources}
                            onChange={(event) =>
                                setExtraSources(event.target.value)
                            }
                            placeholder={"tag:server\nautogroup:member"}
                            className="min-h-20 w-full rounded-md border bg-transparent p-3 font-mono text-sm"
                        />

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Button
                                        key={tag}
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            setSources((previous) =>
                                                [...new Set([
                                                    ...previous,
                                                    tag,
                                                ])]
                                            )
                                        }
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Destinations
                        </p>

                        <PolicyAclDestinationSelector
                            value={destinations}
                            onChange={setDestinations}
                            tags={tags}
                            icmp={isAclIcmpProtocol(protocol)}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Protocol (optional)
                        </p>

                        <PolicyAclProtocolSelector
                            value={protocol}
                            onChange={setProtocol}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    {warnings.length > 0 && (
                        <div className="space-y-2 rounded-md border p-3">
                            <p className="text-sm font-medium">
                                Policy Warnings
                            </p>

                            {warnings.map((warning, index) => (
                                <p
                                    key={index}
                                    className="text-sm text-amber-500"
                                >
                                    {warning.message}
                                </p>
                            ))}
                        </div>
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
                        Save ACL Rule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}