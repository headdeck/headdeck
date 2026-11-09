"use client";

import {useState} from "react";
import {isAclIcmpProtocol} from "@headdeck/shared";

import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const PRESETS = new Set([
    "tcp",
    "udp",
    "sctp",
    "icmp",
    "ipv6-icmp",
]);

export default function PolicyAclProtocolSelector({
                                                      value,
                                                      onChange,
                                                  }: Props) {
    const [customMode, setCustomMode] = useState(false);

    const normalized = value.trim().toLowerCase();

    const mode = customMode
        ? "custom"
        : !normalized
            ? "default"
            : PRESETS.has(normalized)
                ? normalized
                : "custom";

    function changeMode(next: string | null) {
        if (!next) return;

        if (next === "custom") {
            setCustomMode(true);
            onChange("");
            return;
        }

        setCustomMode(false);

        if (next === "default") {
            onChange("");
            return;
        }

        onChange(next);
    }

    const icmp = isAclIcmpProtocol(value);

    return (
        <div className="space-y-3">
            <Select
                value={mode}
                onValueChange={changeMode}
            >
                <SelectTrigger>
                    <SelectValue/>
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="default">
                        Default
                    </SelectItem>

                    <SelectItem value="tcp">
                        TCP
                    </SelectItem>

                    <SelectItem value="udp">
                        UDP
                    </SelectItem>

                    <SelectItem value="sctp">
                        SCTP
                    </SelectItem>

                    <SelectItem value="icmp">
                        ICMPv4
                    </SelectItem>

                    <SelectItem value="ipv6-icmp">
                        ICMPv6
                    </SelectItem>

                    <SelectItem value="custom">
                        Custom Protocol
                    </SelectItem>
                </SelectContent>
            </Select>

            {mode === "custom" && (
                <div className="space-y-2">
                    <Input
                        value={value}
                        onChange={(event) =>
                            onChange(event.target.value)
                        }
                        placeholder="Protocol name or number"
                        className="font-mono"
                    />

                    <p className="text-xs text-muted-foreground">
                        Enter an IP protocol number (0–255)
                        or preserve a protocol identifier
                        from an existing policy.
                    </p>
                </div>
            )}

            {icmp && (
                <p className="text-xs text-muted-foreground">
                    ICMP does not use transport ports.
                    Use * in the destination port field.
                </p>
            )}

            {mode === "default" && (
                <p className="text-xs text-muted-foreground">
                    Omit the proto field and use
                    Headscale&apos;s default behavior.
                </p>
            )}
        </div>
    );
}