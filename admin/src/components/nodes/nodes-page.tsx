"use client";

import {useMemo, useState} from "react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronRight,
    Monitor,
    Network,
    Search,
    Server,
    Wifi,
    WifiOff,
    X
} from "lucide-react";

import {NodeSchema} from "@headdeck/shared";

import Pagination from "@/components/common/pagination";
import NodeDetails from "@/components/nodes/node-details";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {getNodeStatus, getNodeStatusBadge, NodeStatus} from "@/components/nodes/node-status";

type Node = NodeSchema.NodeSummary;

type Props = {
    nodes: Node[];
    availableTags: string[];
};

type SortField = "name" | "user" | "status" | "id";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | NodeStatus;

function getIPv4(node: Node) {
    return node.ipAddresses.find((ip) => ip.includes(".")) ?? "—";
}

export default function NodesPage({nodes, availableTags}: Props) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const nodesStatus: NodeStatus[] = nodes.map(getNodeStatus);

    const filteredNodes = useMemo(() => {
        const query = search.trim().toLowerCase();

        return nodes
            .filter((node) => {
                const matchesSearch = [
                    node.id,
                    node.name,
                    node.givenName,
                    node.user.name,
                    ...node.ipAddresses,
                    ...node.tags,
                ].some((value) => value.toLowerCase().includes(query));

                const matchesStatus = status === "all" || getNodeStatus(node) === status;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                let result: number;

                switch (sortField) {
                    case "id":
                        result = BigInt(a.id) < BigInt(b.id)
                            ? -1
                            : BigInt(a.id) > BigInt(b.id)
                                ? 1
                                : 0;
                        break;

                    case "user":
                        result = a.user.name.localeCompare(b.user.name);
                        break;

                    case "status": {
                        const order: Record<NodeStatus, number> = {
                            online: 0,
                            offline: 1,
                            expired: 2,
                        };

                        result = order[getNodeStatus(a)] - order[getNodeStatus(b)];
                        break;
                    }

                    default:
                        result = a.name.localeCompare(b.name);
                }

                return sortDirection === "asc" ? result : -result;
            });
    }, [nodes, search, status, sortField, sortDirection]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredNodes.length / pageSize),
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedNodes = useMemo(() => {
        const start = (currentPage - 1) * pageSize;

        return filteredNodes.slice(start, start + pageSize);
    }, [filteredNodes, currentPage, pageSize]);

    const selectedNode =
        nodes.find((node) => node.id === selectedId) ?? null;

    function handleSort(field: SortField) {
        if (sortField === field) {
            setSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc",
            );
        } else {
            setSortField(field);
            setSortDirection("asc");
        }

        setPage(1);
    }

    function SortIcon({field}: { field: SortField }) {
        if (sortField !== field) {
            return <ArrowUpDown className="size-3.5"/>;
        }

        return sortDirection === "asc"
            ? <ArrowUp className="size-3.5"/>
            : <ArrowDown className="size-3.5"/>;
    }

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
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
                {[
                    {label: "Total Nodes", value: nodes.length, icon: Network},
                    {label: "Online", value: nodesStatus.filter(status => status === "online").length, icon: Wifi},
                    {
                        label: "Offline",
                        value: nodesStatus.filter(status => status === "offline").length,
                        icon: WifiOff,
                    },
                    {
                        label: "Expired",
                        value: nodesStatus.filter(status => status === "expired").length,
                        icon: X,
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
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search nodes, users, IPs, tags..."
                                className="h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </label>

                        <label>
                            <span className="sr-only">Filter by status</span>
                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value as StatusFilter);
                                    setPage(1);
                                }}
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="all">All statuses</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="expired">Expired</option>
                            </select>
                        </label>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort("name")}
                                        >
                                            Node
                                            <SortIcon field="name"/>
                                        </Button>
                                    </TableHead>

                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort("user")}
                                        >
                                            User
                                            <SortIcon field="user"/>
                                        </Button>
                                    </TableHead>

                                    <TableHead>IPv4</TableHead>

                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort("status")}
                                        >
                                            Status
                                            <SortIcon field="status"/>
                                        </Button>
                                    </TableHead>

                                    <TableHead>Tags</TableHead>
                                    <TableHead>Routes</TableHead>

                                    <TableHead className="text-right">
                                        Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedNodes.map((node) => (
                                    <TableRow key={node.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {node.tags.includes("tag:server") ? (
                                                    <Server className="size-4 text-muted-foreground"/>
                                                ) : (
                                                    <Monitor className="size-4 text-muted-foreground"/>
                                                )}
                                                <span className="font-medium">
                                                    {node.givenName || node.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>{node.user.name}</TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {getIPv4(node)}
                                        </TableCell>

                                        <TableCell>
                                            {getNodeStatusBadge(node)}
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

                                        <TableCell>
                                            <div className="flex flex-col items-start gap-1.5">
                                                {node.availableRoutes.length ? (
                                                    node.availableRoutes.map((route) => {
                                                        const approved = node.approvedRoutes.includes(route);

                                                        return (
                                                            <div
                                                                key={route}
                                                                className="flex flex-wrap items-center gap-2"
                                                            >
                                                                <code className="whitespace-nowrap text-xs">
                                                                    {route}
                                                                </code>

                                                                <Badge
                                                                    variant={approved ? "secondary" : "outline"}
                                                                >
                                                                    {approved ? "Approved" : "Not approved"}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`View ${node.name} details`}
                                                onClick={() => setSelectedId(node.id)}
                                            >
                                                <ChevronRight className="size-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {paginatedNodes.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No nodes registered yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Pagination
                        page={currentPage}
                        pageSize={pageSize}
                        totalItems={filteredNodes.length}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                    />
                </CardContent>
            </Card>

            <NodeDetails
                node={selectedNode}
                onClose={() => setSelectedId(null)}
                availableTags={availableTags}
            />
        </div>
    );
}