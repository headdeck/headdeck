"use client";

import {useEffect, useMemo, useRef, useState, useTransition} from "react";
import {Check, ChevronRight, Clock3, KeyRound, Plus, RefreshCw, Search, ShieldCheck, XCircle} from "lucide-react";
import {useRouter} from "next/navigation";

import {PreAuthKeySchema, UserSchema} from "@headdeck/shared";

import CreatePreAuthKeyDialog from "@/components/preauth-keys/create-preauth-key-dialog";
import PreAuthKeyDetails from "@/components/preauth-keys/preauth-key-details";
import DeleteExpiredPreAuthKeysDialog from "@/components/preauth-keys/delete-expired-preauth-keys-dialog";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

type PreAuthKey = PreAuthKeySchema.PreAuthKey;

type Props = {
    keys: PreAuthKey[];
    users: UserSchema.User[];
    availableTags: string[];
};

type KeyStatus = "active" | "used" | "expired";

function getStatus(key: PreAuthKey): KeyStatus {
    if (new Date(key.expiration).getTime() <= Date.now()) {
        return "expired";
    }

    if (!key.reusable && key.used) {
        return "used";
    }

    return "active";
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(new Date(value));
}

function getUserName(key: PreAuthKey): string {
    return key.user?.name ?? "Unknown";
}

function StatusBadge({status}: { status: KeyStatus }) {
    if (status === "active") {
        return (
            <Badge variant="secondary">
                <Check className="size-3 text-emerald-500"/>
                Active
            </Badge>
        );
    }

    if (status === "used") {
        return (
            <Badge variant="outline">
                <ShieldCheck className="size-3"/>
                Used
            </Badge>
        );
    }

    return (
        <Badge variant="outline">
            <XCircle className="size-3"/>
            Expired
        </Badge>
    );
}

export default function PreAuthKeysPage({keys: serverKeys, availableTags, users}: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [keys, setKeys] = useState(serverKeys);
    const deletedKeyIds = useRef(new Set<string>());
    const [isRefreshing, startRefresh] = useTransition();

    function handleRefresh() {
        startRefresh(() => {
            router.refresh();
        });
    }

    useEffect(() => {
        setKeys((current) => {
            const currentById = new Map(
                current.map((key) => [key.id, key]),
            );

            return serverKeys
                .filter((serverKey) => !deletedKeyIds.current.has(serverKey.id))
                .map((serverKey) => {
                    const localKey = currentById.get(serverKey.id);

                    if (
                        localKey &&
                        new Date(localKey.expiration).getTime() <
                        new Date(serverKey.expiration).getTime()
                    ) {
                        return {
                            ...serverKey,
                            expiration: localKey.expiration,
                        };
                    }

                    return serverKey;
                });
        });
    }, [serverKeys]);

    function handleKeyUpdated(expiredKeyId: string) {
        setKeys((current) =>
            current.map((key) =>
                key.id === expiredKeyId
                    ? {
                        ...key,
                        expiration: new Date().toISOString(),
                    }
                    : key,
            ),
        );

        setSelectedId(null);
        router.refresh();
    }

    function handleKeyDeleted(deletedKeyId: string) {
        deletedKeyIds.current.add(deletedKeyId);

        setKeys((current) =>
            current.filter((key) => key.id !== deletedKeyId),
        );

        setSelectedId(null);
        router.refresh();
    }

    function handleExpiredKeysDeleted(ids: string[]) {
        if (ids.length === 0) {
            router.refresh();
            return;
        }

        const deleted = new Set(ids);

        for (const id of ids) {
            deletedKeyIds.current.add(id);
        }

        setKeys((current) =>
            current.filter((key) => !deleted.has(key.id)),
        );

        setSelectedId(null);
        router.refresh();
    }

    const filteredKeys = useMemo(() => {
        const query = search.trim().toLowerCase();

        return keys.filter((key) => {
            const matchesSearch = [
                key.id,
                key.key,
                getUserName(key),
                ...key.aclTags,
            ].some((value) =>
                value.toLowerCase().includes(query),
            );

            const matchesStatus =
                status === "all" || getStatus(key) === status;

            return matchesSearch && matchesStatus;
        });
    }, [keys, search, status]);

    const selectedKey =
        keys.find((key) => key.id === selectedId) ?? null;

    const activeCount = keys.filter(
        (key) => getStatus(key) === "active",
    ).length;

    const expiredCount = keys.filter(
        (key) => getStatus(key) === "expired",
    ).length;

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Pre-auth Keys
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage registration keys for Headscale nodes.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        disabled={isRefreshing}
                        onClick={handleRefresh}
                    >
                        <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}/>
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>

                    <DeleteExpiredPreAuthKeysDialog
                        expiredCount={expiredCount}
                        onComplete={handleExpiredKeysDeleted}
                    />

                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4"/>
                        Create Key
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: "Total Keys",
                        value: keys.length,
                        icon: KeyRound,
                    },
                    {
                        label: "Active Keys",
                        value: activeCount,
                        icon: ShieldCheck,
                    },
                    {
                        label: "Expired Keys",
                        value: expiredCount,
                        icon: Clock3,
                    },
                ].map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <Card key={metric.label}>
                            <CardContent className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {metric.label}
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                                        {metric.value}
                                    </p>
                                </div>

                                <Icon className="size-5 text-muted-foreground"/>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <label className="relative min-w-48 flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>

                            <span className="sr-only">
                                Search pre-auth keys
                            </span>

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by key ID, key, user or tag..."
                                className="pl-9"
                            />
                        </label>

                        <label>
                            <span className="sr-only">
                                Filter by key status
                            </span>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="used">Used</option>
                                <option value="expired">Expired</option>
                            </select>
                        </label>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Key ID</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ephemeral</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead className="text-right">
                                        Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="size-4 text-muted-foreground"/>

                                                <span className="font-mono font-medium">
                                                    #{key.id}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <span className="font-mono text-xs">
                                                {key.key}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            {getUserName(key)}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="outline">
                                                {key.reusable
                                                    ? "Reusable"
                                                    : "Single-use"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <StatusBadge status={getStatus(key)}/>
                                        </TableCell>

                                        <TableCell>
                                            {key.ephemeral ? "Yes" : "No"}
                                        </TableCell>

                                        <TableCell className="text-muted-foreground">
                                            {formatDate(key.expiration)}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`View key ${key.id} details`}
                                                onClick={() =>
                                                    setSelectedId(key.id)
                                                }
                                            >
                                                <ChevronRight className="size-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredKeys.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            {keys.length === 0 && !search && status === "all"
                                                ? "No pre-auth keys created yet."
                                                : "No matching keys found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Showing {filteredKeys.length} of {keys.length} keys
                    </p>
                </CardContent>
            </Card>

            <PreAuthKeyDetails
                selectedKey={selectedKey}
                onClose={() => setSelectedId(null)}
                onSuccess={handleKeyUpdated}
                onDeleteSuccess={handleKeyDeleted}
            />

            <CreatePreAuthKeyDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                users={users}
                availableTags={availableTags}
            />
        </div>
    );
}