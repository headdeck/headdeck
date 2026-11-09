"use client";

import {useState} from "react";
import {Pencil, Plus, Trash2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

import {formatAclDestination, parseAclDestination, validateAclPorts,} from "./policy-acl-destination-utils";

type Props = {
    value: string[];
    onChange: (value: string[]) => void;
    tags: string[];
    icmp?: boolean;
};

export default function PolicyAclDestinationSelector({
                                                         value,
                                                         onChange,
                                                         tags,
                                                         icmp = false,
                                                     }: Props) {
    const [editing, setEditing] = useState<number | null>(null);
    const [target, setTarget] = useState("");
    const [ports, setPorts] = useState("443");
    const [error, setError] = useState<string | null>(null);

    const [targetMode, setTargetMode] = useState<
        "tag" | "custom"
    >(tags.length ? "tag" : "custom");

    function reset() {
        setEditing(null);
        setTarget("");
        setPorts("443");
        setError(null);
    }

    function startEdit(index: number) {
        const parsed = parseAclDestination(value[index]);

        if (!parsed) {
            setError("Cannot parse this destination.");
            return;
        }

        setEditing(index);
        setTarget(parsed.target);
        setPorts(parsed.ports);
        setTargetMode(
            tags.includes(parsed.target) ? "tag" : "custom",
        );
        setError(null);
    }

    function save() {
        const normalizedTarget = target.trim();

        if (!normalizedTarget) {
            setError("Select or enter a destination.");
            return;
        }

        if (
            targetMode === "tag" &&
            !tags.includes(normalizedTarget)
        ) {
            setError("Select an existing policy tag.");
            return;
        }

        if (
            targetMode === "custom" &&
            normalizedTarget.includes(":") &&
            !normalizedTarget.startsWith("[") &&
            !normalizedTarget.startsWith("tag:")
        ) {
            setError(
                "IPv6 destinations must use brackets.",
            );
            return;
        }

        if (icmp && ports.trim() !== "*") {
            setError("ICMP destinations must use * instead of ports.");
            return;
        }

        const portError = validateAclPorts(ports);

        if (portError) {
            setError(portError);
            return;
        }

        const formatted = formatAclDestination(
            normalizedTarget,
            ports,
        );

        if (
            value.some(
                (entry, index) =>
                    entry === formatted && index !== editing,
            )
        ) {
            setError("This destination already exists.");
            return;
        }

        if (editing === null) {
            onChange([...value, formatted]);
        } else {
            onChange(
                value.map((entry, index) =>
                    index === editing ? formatted : entry,
                ),
            );
        }

        reset();
    }

    return (
        <div className="space-y-4">
            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((entry, index) => {
                        const parsed = parseAclDestination(entry);

                        return (
                            <div
                                key={`${index}:${entry}`}
                                className="flex items-center justify-between gap-3 rounded-md border p-3"
                            >
                                <div className="min-w-0">
                                    <p className="break-all font-mono text-sm">
                                        {parsed?.target ?? entry}
                                    </p>

                                    {parsed && (
                                        <p className="text-xs text-muted-foreground">
                                            Ports: {parsed.ports}
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Edit destination ${index + 1}`}
                                        onClick={() => startEdit(index)}
                                    >
                                        <Pencil className="size-4"/>
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Remove destination ${index + 1}`}
                                        onClick={() => {
                                            onChange(
                                                value.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            );
                                            reset();
                                        }}
                                    >
                                        <Trash2 className="size-4 text-destructive"/>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="space-y-3 rounded-md border p-3">
                <p className="text-sm font-medium">
                    {editing === null
                        ? "Add Destination"
                        : "Edit Destination"}
                </p>

                <Select
                    value={targetMode}
                    onValueChange={(next) => {
                        if (next !== "tag" && next !== "custom") return;

                        setTargetMode(next);
                        setTarget("");
                        setError(null);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue/>
                    </SelectTrigger>

                    <SelectContent>
                        {tags.length > 0 && (
                            <SelectItem value="tag">
                                Policy Tag
                            </SelectItem>
                        )}

                        <SelectItem value="custom">
                            Custom Destination
                        </SelectItem>
                    </SelectContent>
                </Select>

                {targetMode === "tag" ? (
                    <Select
                        value={tags.includes(target) ? target : null}
                        onValueChange={(value) => {
                            setTarget(value ?? "");
                            setError(null);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select tag"/>
                        </SelectTrigger>

                        <SelectContent>
                            {tags.map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                    {tag}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={target}
                        onChange={(event) =>
                            setTarget(event.target.value)
                        }
                        placeholder="10.0.0.0/24, *, or [IPv6]"
                        className="font-mono"
                    />
                )}

                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        {icmp ? "Destination Port Field" : "Ports"}
                    </p>

                    <Input
                        value={ports}
                        onChange={(event) =>
                            setPorts(event.target.value)
                        }
                        placeholder={
                            icmp
                                ? "*"
                                : "443, 80,443, 8000-8080, or *"
                        }
                        className="font-mono"
                    />

                    {icmp && (
                        <p className="text-xs text-muted-foreground">
                            ICMP has no transport ports. Enter *.
                        </p>
                    )}
                </div>

                {error && (
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={save}
                    >
                        <Plus className="size-4"/>
                        {editing === null
                            ? "Add Destination"
                            : "Save Destination"}
                    </Button>

                    {editing !== null && (
                        <Button
                            variant="ghost"
                            onClick={reset}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                {value.length} destination(s) configured.
                {icmp
                    ? " ICMP destinations use * in the port field."
                    : " All ports (*) grants access to every port allowed by the selected protocol."}
            </p>
        </div>
    );
}