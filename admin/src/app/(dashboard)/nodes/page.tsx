"use client";

import {useMemo, useState} from "react";
import {ChevronRight, Monitor, Network, Search, Server, Wifi, WifiOff,} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent,} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";

type Node = {
    id: string;
    name: string;
    user: string;
    ipv4: string;
    ipv6: string;
    online: boolean;
    lastSeen: string;
    createdAt: string;
    expiresAt: string | null;
    tags: string[];
    approvedRoutes: string[];
    advertisedRoutes: string[];
};

const nodes: Node[] = [
    {
        id: "1",
        name: "dev-workstation",
        user: "developer",
        ipv4: "100.64.0.11",
        ipv6: "fd7a:115c:a1e0::11",
        online: true,
        lastSeen: "2026-11-08T09:00:00Z",
        createdAt: "2026-11-08T08:00:00Z",
        expiresAt: null,
        tags: ["tag:development"],
        approvedRoutes: [],
        advertisedRoutes: [],
    },
    {
        id: "2",
        name: "production-server",
        user: "infrastructure",
        ipv4: "100.64.0.12",
        ipv6: "fd7a:115c:a1e0::12",
        online: true,
        lastSeen: "2026-11-08T09:10:00Z",
        createdAt: "2026-11-07T08:00:00Z",
        expiresAt: null,
        tags: ["tag:server"],
        approvedRoutes: ["10.0.0.0/24"],
        advertisedRoutes: ["10.0.0.0/24"],
    },
    {
        id: "3",
        name: "laptop",
        user: "developer",
        ipv4: "100.64.0.13",
        ipv6: "fd7a:115c:a1e0::13",
        online: false,
        lastSeen: "2026-11-06T15:00:00Z",
        createdAt: "2026-11-06T08:00:00Z",
        expiresAt: "2027-01-01T00:00:00Z",
        tags: [],
        approvedRoutes: [],
        advertisedRoutes: [],
    },
    {
        id: "4",
        name: "backup-server",
        user: "infrastructure",
        ipv4: "100.64.0.14",
        ipv6: "fd7a:115c:a1e0::14",
        online: true,
        lastSeen: "2026-11-08T09:15:00Z",
        createdAt: "2026-11-05T08:00:00Z",
        expiresAt: null,
        tags: ["tag:backup"],
        approvedRoutes: [],
        advertisedRoutes: [],
    },
    {
        id: "5",
        name: "remote-gateway",
        user: "infrastructure",
        ipv4: "100.64.0.15",
        ipv6: "fd7a:115c:a1e0::15",
        online: false,
        lastSeen: "2026-11-04T10:00:00Z",
        createdAt: "2026-11-04T08:00:00Z",
        expiresAt: null,
        tags: ["tag:gateway"],
        approvedRoutes: [],
        advertisedRoutes: ["192.168.10.0/24"],
    },
];

function formatDate(value: string | null) {
    if (!value) return "Never";

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

function NodeStatus({online}: { online: boolean }) {
    return (
        <Badge variant={online ? "secondary" : "outline"}>
            {online ? (
                <Wifi className="size-3 text-emerald-500"/>
            ) : (
                <WifiOff className="size-3"/>
            )}
            {online ? "Online" : "Offline"}
        </Badge>
    );
}

function NodeDetails({
                         node,
                         onClose,
                     }: {
    node: Node | null;
    onClose: () => void;
}) {
    return (
        <Sheet
            open={node !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent
                side="right"
                className="w-full gap-0 overflow-y-auto sm:max-w-lg"
            >
                {node && (
                    <>
                        <SheetHeader className="border-b">
                            <SheetTitle className="break-all">
                                {node.name}
                            </SheetTitle>
                            <SheetDescription>
                                View node information and management options.
                            </SheetDescription>

                            <div className="flex flex-wrap items-center gap-2 pt-3">
                                <NodeStatus online={node.online}/>
                                <Badge variant="outline">
                                    ID: {node.id}
                                </Badge>
                            </div>
                        </SheetHeader>

                        <div className="flex flex-col gap-6 p-4 text-sm">
                            <section className="space-y-3">
                                <h3 className="font-semibold">
                                    Node Information
                                </h3>

                                {[
                                    ["User", node.user],
                                    ["IPv4", node.ipv4],
                                    ["IPv6", node.ipv6],
                                    ["Registered", formatDate(node.createdAt)],
                                    ["Last Seen", formatDate(node.lastSeen)],
                                    ["Expires", formatDate(node.expiresAt)],
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
                                <h3 className="font-semibold">Tags</h3>

                                <div className="flex flex-wrap gap-2">
                                    {node.tags.length ? (
                                        node.tags.map((tag) => (
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
                                    Advertised Routes
                                </h3>

                                {node.advertisedRoutes.length ? (
                                    node.advertisedRoutes.map((route) => (
                                        <div
                                            key={route}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                                        >
                                            <code className="break-all text-xs">
                                                {route}
                                            </code>

                                            <Badge
                                                variant={
                                                    node.approvedRoutes.includes(route)
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {node.approvedRoutes.includes(route)
                                                    ? "Approved"
                                                    : "Not approved"}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">
                                        No advertised routes.
                                    </p>
                                )}
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Management Actions
                                </h3>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" disabled>
                                        Rename
                                    </Button>
                                    <Button variant="outline" disabled>
                                        Edit Tags
                                    </Button>
                                    <Button variant="outline" disabled>
                                        Expire Node
                                    </Button>
                                    <Button variant="destructive" disabled>
                                        Delete Node
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Actions will be available after Headscale
                                    API integration.
                                </p>
                            </section>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default function NodesPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filteredNodes = useMemo(() => {
        const query = search.trim().toLowerCase();

        return nodes.filter((node) => {
            const matchesSearch = [
                node.name,
                node.user,
                node.ipv4,
                node.ipv6,
                ...node.tags,
            ].some((value) => value.toLowerCase().includes(query));

            const matchesStatus =
                status === "all" ||
                (status === "online" && node.online) ||
                (status === "offline" && !node.online);

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

    const selectedNode =
        nodes.find((node) => node.id === selectedId) ?? null;

    const onlineCount = nodes.filter((node) => node.online).length;

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Nodes
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage registered devices and their routes.
                    </p>
                </div>

                <Badge variant="outline">Preview Data</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {label: "Total Nodes", value: nodes.length, icon: Network},
                    {label: "Online", value: onlineCount, icon: Wifi},
                    {
                        label: "Offline",
                        value: nodes.length - onlineCount,
                        icon: WifiOff,
                    },
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.label}>
                            <CardContent className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                                        {item.value}
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
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="relative min-w-48 flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                            <span className="sr-only">Search nodes</span>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search nodes, users, IPs, tags..."
                                className="h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </label>

                        <label>
                            <span className="sr-only">Filter by status</span>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="all">All statuses</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </label>
                    </div>

                    <div className="min-w-0">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Node</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>IPv4</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead className="text-right">Details</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredNodes.map((node) => (
                                        <TableRow
                                            key={node.id}
                                            className={
                                                selectedId === node.id
                                                    ? "bg-muted/50"
                                                    : undefined
                                            }
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {node.tags.includes("tag:server") ? (
                                                        <Server className="size-4 text-muted-foreground"/>
                                                    ) : (
                                                        <Monitor className="size-4 text-muted-foreground"/>
                                                    )}
                                                    <span className="font-medium">
                              {node.name}
                            </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{node.user}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {node.ipv4}
                                            </TableCell>
                                            <TableCell>
                                                <NodeStatus online={node.online}/>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {node.tags.length
                                                        ? node.tags.map((tag) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="outline"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                        : "—"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`View ${node.name} details`}
                                                    onClick={() =>
                                                        setSelectedId(
                                                            selectedId === node.id
                                                                ? null
                                                                : node.id
                                                        )
                                                    }
                                                >
                                                    <ChevronRight className="size-4"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {filteredNodes.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                No matching nodes found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                            Showing {filteredNodes.length} of {nodes.length} nodes
                        </p>
                    </div>
                </CardContent>
            </Card>

            <NodeDetails
                node={selectedNode}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
}