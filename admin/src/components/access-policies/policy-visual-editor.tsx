"use client";

import {useMemo, useState} from "react";

import type {PolicySchema} from "@headdeck/shared";
import {parsePolicyDocument, updatePolicyAcl, updatePolicyMapEntry, UserSchema,} from "@headdeck/shared";

import PolicyMapEditor from "./policy-map-editor";
import {findGroupReferences} from "./policy-references";

import PolicyAclEditor from "./policy-acl-editor";

type Props = {
    value: string;
    onChange: (value: string) => void;
    users: UserSchema.User[];
};

export default function PolicyVisualEditor({
                                               value,
                                               onChange,
                                               users,
                                           }: Props) {
    const [error, setError] = useState<string | null>(null);

    const policy = useMemo(
        () => {
            try {
                return parsePolicyDocument(value);
            } catch {
                return null;
            }
        },
        [value],
    );

    if (!policy) {
        return (
            <p className="text-sm text-destructive">
                Fix the HuJSON document before using
                the visual editor.
            </p>
        );
    }

    function update(
        section: "groups" | "tagOwners",
        name: string,
        members: string[] | undefined,
    ) {
        try {
            const next = updatePolicyMapEntry(
                value,
                section,
                name,
                members,
            );

            onChange(next);
            setError(null);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Failed to update policy",
            );
        }
    }

    function updateAcl(
        index: number | null,
        rule: PolicySchema.PolicyACLRule | undefined,
    ) {
        try {
            const next = updatePolicyAcl(value, index, rule);

            onChange(next);
            setError(null);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Failed to update ACL rule",
            );
        }
    }

    return (
        <div className="space-y-4">
            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <PolicyMapEditor
                title="Groups"
                prefix="group:"
                entries={policy.groups ?? {}}
                users={users}
                getDeleteWarnings={(name) =>
                    findGroupReferences(policy, name)
                }
                onChange={(name, members) =>
                    update("groups", name, members)
                }
            />

            <PolicyMapEditor
                title="Tag Owners"
                prefix="tag:"
                entries={policy.tagOwners ?? {}}
                users={users}
                groups={Object.keys(policy.groups ?? {})}
                allowGroups
                onChange={(name, members) =>
                    update("tagOwners", name, members)
                }
            />

            <PolicyAclEditor
                rules={policy.acls ?? []}
                users={users}
                groups={Object.keys(policy.groups ?? {})}
                tags={Object.keys(policy.tagOwners ?? {})}
                onChange={updateAcl}
            />
        </div>
    );
}