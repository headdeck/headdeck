"use client";

import {useMemo, useState} from "react";
import {
    CalendarClock,
    Check,
    ChevronRight,
    Clock3,
    KeyRound,
    Plus,
    Search,
    ShieldCheck,
    ShieldX,
    X,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

type ApiKey = {
    id: number;
    prefix: string;
    createdAt: string;
    expiresAt: string;
};

const previewKeys: ApiKey[] = [
    {
        id: 1,
        prefix: "hskey-api-a1b2c3",
        createdAt: "2026-11-01T08:00:00Z",
        expiresAt: "2027-01-01T08:00:00Z",
    },
    {
        id: 2,
        prefix: "hskey-api-d4e5f6",
        createdAt: "2026-10-15T12:00:00Z",
        expiresAt: "2026-12-15T12:00:00Z",
    },
    {
        id: 3,
        prefix: "hskey-api-g7h8i9",
        createdAt: "2026-09-01T08:00:00Z",
        expiresAt: "2026-11-01T08:00:00Z",
    },
    {
        id: 4,
        prefix: "hskey-api-j1k2l3",
        createdAt: "2026-08-10T08:00:00Z",
        expiresAt: "2026-10-10T08:00:00Z",
    },
    {
        id: 5,
        prefix: "hskey-api-m4n5o6",
        createdAt: "2026-11-05T08:00:00Z",
        expiresAt: "2027-02-05T08:00:00Z",
    },
];

function isExpired(key: ApiKey) {
    return new Date(key.expiresAt).getTime() <= Date.now();
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(new Date(value));
}

export default function ApiKeysPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selected, setSelected] = useState<ApiKey | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [expirationHours, setExpirationHours] = useState("720");

    const now = Date.now();

    const activeCount = previewKeys.filter(
        (key) => new Date(key.expiresAt).getTime() > now,
    ).length;

    const expiredCount = previewKeys.length - activeCount;

    const filtered = useMemo(() => {
        return previewKeys.filter((key) => {
            const matchesSearch =
                key.prefix.toLowerCase().includes(search.toLowerCase()) ||
                String(key.id).includes(search);

            const expired = isExpired(key);

            const matchesStatus =
                status === "all" ||
                (status === "active" && !expired) ||
                (status === "expired" && expired);

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

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

                <div className="flex items-center gap-2">
                    <Badge variant="outline">Preview Data</Badge>

                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4"/>
                        Create API Key
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Keys
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {previewKeys.length}
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
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by key prefix or ID..."
                                className="pl-9"
                            />
                        </div>

                        <Select value={status} onValueChange={(value) => {
                            if (value !== null) setStatus(value);
                        }}>
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
                                    const expired = isExpired(key);

                                    return (
                                        <TableRow
                                            key={key.id}
                                            className="cursor-pointer"
                                            onClick={() => setSelected(key)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <KeyRound className="size-4 text-muted-foreground"/>
                                                    <span className="font-mono">
                            {key.prefix}
                          </span>
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
                                                {formatDate(key.expiresAt)}
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
                        Showing {filtered.length} of {previewKeys.length} keys
                    </p>
                </CardContent>
            </Card>

            <Sheet
                open={selected !== null}
                onOpenChange={(open) => {
                    if (!open) setSelected(null);
                }}
            >
                <SheetContent className="overflow-y-auto">
                    {selected && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="font-mono">
                                    {selected.prefix}
                                </SheetTitle>
                                <SheetDescription>
                                    API key information and management options.
                                </SheetDescription>

                                <div className="pt-2">
                                    <Badge variant="outline">
                                        {isExpired(selected) ? "Expired" : "Active"}
                                    </Badge>
                                </div>
                            </SheetHeader>

                            <div className="space-y-6 px-4 pb-6">
                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold">
                                        Key Information
                                    </h3>

                                    <div className="grid grid-cols-[100px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">
                      ID
                    </span>
                                        <span>{selected.id}</span>

                                        <span className="text-muted-foreground">
                      Prefix
                    </span>
                                        <span className="break-all font-mono">
                      {selected.prefix}
                    </span>

                                        <span className="text-muted-foreground">
                      Created
                    </span>
                                        <span>{formatDate(selected.createdAt)}</span>

                                        <span className="text-muted-foreground">
                      Expires
                    </span>
                                        <span>{formatDate(selected.expiresAt)}</span>
                                    </div>
                                </section>

                                <div className="border-t pt-5">
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0"/>
                                        <p>
                                            Headscale does not expose the complete secret
                                            when listing existing API keys.
                                        </p>
                                    </div>
                                </div>

                                <section className="space-y-3 border-t pt-5">
                                    <h3 className="text-sm font-semibold">
                                        Management Actions
                                    </h3>

                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        disabled
                                    >
                                        <Clock3 className="size-4"/>
                                        Expire API Key
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full text-destructive"
                                        disabled
                                    >
                                        <X className="size-4"/>
                                        Delete API Key
                                    </Button>

                                    <p className="text-xs text-muted-foreground">
                                        Actions will be available after Headscale API
                                        integration.
                                    </p>
                                </section>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                            Configure a new Headscale API key. This is a UI
                            preview; no key will be generated.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="api-key-expiration"
                                className="text-sm font-medium"
                            >
                                Expiration (hours)
                            </label>

                            <Input
                                id="api-key-expiration"
                                type="number"
                                min={1}
                                step={1}
                                value={expirationHours}
                                onChange={(event) =>
                                    setExpirationHours(event.target.value)
                                }
                            />

                            <p className="text-xs text-muted-foreground">
                                How long the API key remains valid after creation.
                            </p>
                        </div>

                        <div className="rounded-md border p-3">
                            <div className="flex items-start gap-3">
                                <CalendarClock className="mt-0.5 size-4 text-muted-foreground"/>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Expiration Preview
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {Number.isSafeInteger(Number(expirationHours)) &&
                                        Number(expirationHours) > 0 &&
                                        Number(expirationHours) <= 87600
                                            ? formatDate(
                                                new Date(
                                                    Date.now() +
                                                    Number(expirationHours) * 3600000,
                                                ).toISOString(),
                                            )
                                            : "Enter a valid duration between 1 and 87600 hours."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border p-3 text-xs text-muted-foreground">
                            The complete API key will only be shown after
                            successful creation during Phase 2. Store it
                            securely; it cannot be retrieved later.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreateOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled>
                            <Plus className="size-4"/>
                            Generate API Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}