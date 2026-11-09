"use client";

import {useState} from "react";
import {UserSchema} from "@headdeck/shared";
import {Check, Search} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";

import {getPolicyUserPrincipal} from "./policy-principals";

type Props = {
    users: UserSchema.User[];
    groups?: string[];
    value: string[];
    onChange: (value: string[]) => void;
    allowGroups?: boolean;
};

export default function PolicyMemberSelector({
                                                 users,
                                                 groups = [],
                                                 value,
                                                 onChange,
                                                 allowGroups = false,
                                             }: Props) {
    const [search, setSearch] = useState("");

    const options = [
        ...users.map((user) => ({
            value: getPolicyUserPrincipal(user),
            label: user.displayName || user.name,
            description: user.email || "Headscale user",
            type: "user" as const,
        })),
        ...(allowGroups
            ? groups.map((group) => ({
                value: group,
                label: group,
                description: "Policy group",
                type: "group" as const,
            }))
            : []),
    ];

    const knownValues = new Set(
        options.map((option) => option.value),
    );

    const unknownValues = value.filter(
        (member) => !knownValues.has(member),
    );

    const filtered = options.filter((option) => {
        const query = search.trim().toLowerCase();

        return (
            option.label.toLowerCase().includes(query) ||
            option.value.toLowerCase().includes(query) ||
            option.description.toLowerCase().includes(query)
        );
    });

    function toggle(member: string, checked: boolean) {
        onChange(
            checked
                ? [...new Set([...value, member])]
                : value.filter((item) => item !== member),
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>

                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users or groups..."
                    className="pl-9"
                />
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-2">
                {filtered.map((option) => (
                    <label
                        key={`${option.type}:${option.value}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
                    >
                        <Checkbox
                            checked={value.includes(option.value)}
                            onCheckedChange={(checked) =>
                                toggle(option.value, checked === true)
                            }
                        />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                                {option.label}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {option.value}
                                {option.description
                                    ? ` · ${option.description}`
                                    : ""}
                            </p>
                        </div>

                        {value.includes(option.value) && (
                            <Check className="size-4 text-emerald-500"/>
                        )}
                    </label>
                ))}

                {filtered.length === 0 && (
                    <p className="p-3 text-sm text-muted-foreground">
                        No matching users or groups.
                    </p>
                )}
            </div>

            {unknownValues.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        Existing principals not found in the current user list:
                    </p>

                    {unknownValues.map((member) => (
                        <div
                            key={member}
                            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                        >
                            <span className="break-all font-mono text-xs">
                                {member}
                            </span>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggle(member, false)}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {value.length} principal(s) selected
            </p>
        </div>
    );
}