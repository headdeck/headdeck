"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Check, ChevronRight, Clock3, KeyRound, Plus, Search, ShieldCheck, ShieldX,} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

import {type ApiKey, formatDate, isExpired, isNeverExpiring,} from "./api-key-utils";
import ApiKeyDetails from "./api-key-details";
import CreateApiKeyDialog from "./create-api-key-dialog";
import CreatedApiKeyDialog from "./created-api-key-dialog";

type Props = {
    apiKeys: ApiKey[];
    currentApiKeyId: string | null;
};

export default function ApiKeysPage({apiKeys, currentApiKeyId}: Props) {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const nextExpiration = apiKeys
            .filter((key) => !isNeverExpiring(key))
            .map((key) => new Date(key.expiration).getTime())
            .filter((expiration) => expiration > Date.now())
            .sort((a, b) => a - b)[0];

        if (nextExpiration === undefined) return;

        const timeout = setTimeout(() => {
            setNow(Date.now());
        }, Math.max(0, nextExpiration - Date.now() + 50));

        return () => clearTimeout(timeout);
    }, [apiKeys, now]);

    useEffect(() => {
        function syncTime() {
            if (document.visibilityState === "visible") {
                setNow(Date.now());
            }
        }

        document.addEventListener("visibilitychange", syncTime);

        return () => {
            document.removeEventListener("visibilitychange", syncTime);
        };
    }, []);

    const selected = apiKeys.find(
        (key) => key.id === selectedId,
    ) ?? null;

    const activeCount = apiKeys.filter(
        (key) => !isExpired(key, now),
    ).length;

    const expiredCount = apiKeys.length - activeCount;

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return apiKeys.filter((key) => {
            const matchesSearch =
                key.prefix.toLowerCase().includes(query) ||
                key.id.includes(query);

            const expired = isExpired(key, now);

            const matchesStatus =
                status === "all" ||
                (status === "active" && !expired) ||
                (status === "expired" && expired);

            return matchesSearch && matchesStatus;
        });
    }, [apiKeys, search, status, now]);

    function handleChanged() {
        setSelectedId(null);
        router.refresh();
    }

    function handleCreated(secret: string) {
        setCreatedSecret(secret);
        router.refresh();
    }

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        API Keys
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage authentication keys for the Headscale API.
                    </p>
                </div>

                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4"/>
                    Create API Key
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Keys
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {apiKeys.length}
                            </p>
                        </div>
                        <KeyRound className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Active Keys
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {activeCount}
                            </p>
                        </div>
                        <ShieldCheck className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Expired Keys
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {expiredCount}
                            </p>
                        </div>
                        <ShieldX className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative min-w-56 flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by key prefix or ID..."
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={status}
                            onValueChange={(value) => {
                                if (value !== null) setStatus(value);
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Key Prefix</TableHead>
                                    <TableHead>Key ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">
                                        Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filtered.map((key) => {
                                    const expired = isExpired(key, now);

                                    return (
                                        <TableRow
                                            key={key.id}
                                            className="cursor-pointer"
                                            onClick={() => setSelectedId(key.id)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <KeyRound className="size-4 text-muted-foreground"/>
                                                    <span className="break-all font-mono">
                                                        {key.prefix}
                                                    </span>
                                                    {key.id === currentApiKeyId && (
                                                        <Badge variant="secondary">
                                                            Current Session
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="font-mono">
                                                {key.id}
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="outline">
                                                    {expired ? (
                                                        <>
                                                            <Clock3 className="size-3"/>
                                                            Expired
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="size-3 text-emerald-500"/>
                                                            Active
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">
                                                {formatDate(key.createdAt)}
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">
                                                {formatDate(key.expiration)}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <ChevronRight className="ml-auto size-4"/>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No API keys match your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Showing {filtered.length} of {apiKeys.length} keys
                    </p>
                </CardContent>
            </Card>

            <ApiKeyDetails
                apiKey={selected}
                now={now}
                isCurrentKey={
                    selected !== null &&
                    selected.id === currentApiKeyId
                }
                onClose={() => setSelectedId(null)}
                onChanged={handleChanged}
            />

            <CreateApiKeyDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleCreated}
            />

            <CreatedApiKeyDialog
                secret={createdSecret}
                onClose={() => setCreatedSecret(null)}
            />
        </div>
    );
}