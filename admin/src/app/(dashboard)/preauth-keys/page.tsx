"use client";

import {useMemo, useState} from "react";
import {Check, ChevronRight, Clock3, KeyRound, Plus, Search, ShieldCheck, XCircle,} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

type PreAuthKey = {
    id: string;
    user: string;
    reusable: boolean;
    ephemeral: boolean;
    used: boolean;
    createdAt: string;
    expiration: string;
    tags: string[];
};

const keys: PreAuthKey[] = [
    {
        id: "101",
        user: "developer",
        reusable: false,
        ephemeral: false,
        used: false,
        createdAt: "2026-11-08T08:00:00Z",
        expiration: "2026-12-08T08:00:00Z",
        tags: ["tag:development"],
    },
    {
        id: "102",
        user: "infrastructure",
        reusable: true,
        ephemeral: false,
        used: true,
        createdAt: "2026-11-07T08:00:00Z",
        expiration: "2027-01-01T00:00:00Z",
        tags: ["tag:server"],
    },
    {
        id: "103",
        user: "operations",
        reusable: false,
        ephemeral: false,
        used: true,
        createdAt: "2026-11-01T08:00:00Z",
        expiration: "2026-12-01T08:00:00Z",
        tags: [],
    },
    {
        id: "104",
        user: "developer",
        reusable: true,
        ephemeral: true,
        used: false,
        createdAt: "2026-10-01T08:00:00Z",
        expiration: "2026-11-01T08:00:00Z",
        tags: ["tag:testing"],
    },
    {
        id: "105",
        user: "infrastructure",
        reusable: false,
        ephemeral: false,
        used: false,
        createdAt: "2026-11-06T08:00:00Z",
        expiration: "2026-11-07T08:00:00Z",
        tags: [],
    },
];

const previewNow = new Date("2026-11-08T09:00:00Z");

type KeyStatus = "active" | "used" | "expired";

function getStatus(key: PreAuthKey): KeyStatus {
    if (new Date(key.expiration) <= previewNow) {
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

function KeyDetails({
                        selectedKey,
                        onClose,
                    }: {
    selectedKey: PreAuthKey | null;
    onClose: () => void;
}) {
    return (
        <Sheet
            open={selectedKey !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent
                side="right"
                className="w-full gap-0 overflow-y-auto sm:max-w-lg"
            >
                {selectedKey && (
                    <>
                        <SheetHeader className="border-b">
                            <SheetTitle>
                                Pre-auth Key #{selectedKey.id}
                            </SheetTitle>
                            <SheetDescription>
                                Registration key information and settings.
                            </SheetDescription>

                            <div className="flex flex-wrap gap-2 pt-3">
                                <StatusBadge status={getStatus(selectedKey)}/>
                                <Badge variant="outline">
                                    {selectedKey.reusable
                                        ? "Reusable"
                                        : "Single-use"}
                                </Badge>
                            </div>
                        </SheetHeader>

                        <div className="flex flex-col gap-6 p-4 text-sm">
                            <section className="space-y-3">
                                <h3 className="font-semibold">
                                    Key Information
                                </h3>

                                {[
                                    ["Key ID", selectedKey.id],
                                    ["User", selectedKey.user],
                                    [
                                        "Reusable",
                                        selectedKey.reusable ? "Yes" : "No",
                                    ],
                                    [
                                        "Ephemeral",
                                        selectedKey.ephemeral ? "Yes" : "No",
                                    ],
                                    ["Used", selectedKey.used ? "Yes" : "No"],
                                    [
                                        "Created",
                                        formatDate(selectedKey.createdAt),
                                    ],
                                    [
                                        "Expires",
                                        formatDate(selectedKey.expiration),
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid grid-cols-[100px_minmax(0,1fr)] gap-3"
                                    >
                    <span className="text-muted-foreground">
                      {label}
                    </span>
                                        <span className="break-all font-medium">
                      {value}
                    </span>
                                    </div>
                                ))}
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Assigned Tags
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {selectedKey.tags.length ? (
                                        selectedKey.tags.map((tag) => (
                                            <Badge key={tag} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">
                                            No tags assigned.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Management Actions
                                </h3>

                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    disabled
                                >
                                    Expire Key
                                </Button>

                                <p className="text-xs text-muted-foreground">
                                    Key management will be enabled during
                                    Headscale API integration.
                                </p>
                            </section>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function CreateKeyDialog({
                             open,
                             onOpenChange,
                         }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [user, setUser] = useState("developer");
    const [expiration, setExpiration] = useState("24");
    const [reusable, setReusable] = useState(false);
    const [ephemeral, setEphemeral] = useState(false);
    const [tags, setTags] = useState("");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Pre-auth Key</DialogTitle>
                    <DialogDescription>
                        Configure a registration key for Headscale.
                        This is a UI preview; no key will be generated.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="key-user">User</Label>
                        <select
                            id="key-user"
                            value={user}
                            onChange={(event) => setUser(event.target.value)}
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        >
                            {[
                                "developer",
                                "infrastructure",
                                "operations",
                                "testing",
                            ].map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="key-expiration">
                            Expiration (hours)
                        </Label>
                        <Input
                            id="key-expiration"
                            type="number"
                            min="1"
                            value={expiration}
                            onChange={(event) =>
                                setExpiration(event.target.value)
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            How long the key remains valid for registration.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={reusable}
                                onChange={(event) =>
                                    setReusable(event.target.checked)
                                }
                                className="mt-1 size-4 accent-primary"
                            />
                            <span>
                <span className="block text-sm font-medium">
                  Reusable Key
                </span>
                <span className="text-xs text-muted-foreground">
                  Allow multiple node registrations with this key.
                </span>
              </span>
                        </label>

                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={ephemeral}
                                onChange={(event) =>
                                    setEphemeral(event.target.checked)
                                }
                                className="mt-1 size-4 accent-primary"
                            />
                            <span>
                <span className="block text-sm font-medium">
                  Ephemeral Nodes
                </span>
                <span className="text-xs text-muted-foreground">
                  Register nodes as ephemeral.
                </span>
              </span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="key-tags">
                            Tags
                        </Label>
                        <Input
                            id="key-tags"
                            placeholder="tag:server, tag:production"
                            value={tags}
                            onChange={(event) => setTags(event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Comma-separated tags to assign during registration.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button disabled>
                        <Plus className="size-4"/>
                        Generate Key
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PreAuthKeysPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const filteredKeys = useMemo(() => {
        const query = search.trim().toLowerCase();

        return keys.filter((key) => {
            const matchesSearch = [
                key.id,
                key.user,
                ...key.tags,
            ].some((value) =>
                value.toLowerCase().includes(query),
            );

            const matchesStatus =
                status === "all" || getStatus(key) === status;

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

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
                    <Badge variant="outline">Preview Data</Badge>
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
                                placeholder="Search by key ID, user or tag..."
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

                                        <TableCell>{key.user}</TableCell>

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
                                                onClick={() => setSelectedId(key.id)}
                                            >
                                                <ChevronRight className="size-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredKeys.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No matching keys found.
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

            <KeyDetails
                selectedKey={selectedKey}
                onClose={() => setSelectedId(null)}
            />

            <CreateKeyDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
        </div>
    );
}