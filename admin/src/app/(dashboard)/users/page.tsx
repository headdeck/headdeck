"use client";

import {useMemo, useState} from "react";
import {ChevronRight, Network, Plus, Search, UserRound, Users,} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent,} from "@/components/ui/card";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

type HeadscaleUser = {
    id: string;
    name: string;
    createdAt: string;
    nodes: {
        id: string;
        name: string;
        ipv4: string;
        online: boolean;
    }[];
};

const users: HeadscaleUser[] = [
    {
        id: "1",
        name: "developer",
        createdAt: "2026-11-02T10:00:00Z",
        nodes: [
            {
                id: "1",
                name: "dev-workstation",
                ipv4: "100.64.0.11",
                online: true,
            },
            {
                id: "3",
                name: "laptop",
                ipv4: "100.64.0.13",
                online: false,
            },
        ],
    },
    {
        id: "2",
        name: "infrastructure",
        createdAt: "2026-10-20T09:00:00Z",
        nodes: [
            {
                id: "2",
                name: "production-server",
                ipv4: "100.64.0.12",
                online: true,
            },
            {
                id: "4",
                name: "backup-server",
                ipv4: "100.64.0.14",
                online: true,
            },
            {
                id: "5",
                name: "remote-gateway",
                ipv4: "100.64.0.15",
                online: false,
            },
        ],
    },
    {
        id: "3",
        name: "operations",
        createdAt: "2026-10-12T08:00:00Z",
        nodes: [
            {
                id: "6",
                name: "monitoring-node",
                ipv4: "100.64.0.16",
                online: true,
            },
        ],
    },
    {
        id: "4",
        name: "testing",
        createdAt: "2026-11-08T08:00:00Z",
        nodes: [],
    },
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

function UserDetails({
                         user,
                         onClose,
                     }: {
    user: HeadscaleUser | null;
    onClose: () => void;
}) {
    return (
        <Sheet
            open={user !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent
                side="right"
                className="w-full gap-0 overflow-y-auto sm:max-w-lg"
            >
                {user && (
                    <>
                        <SheetHeader className="border-b">
                            <SheetTitle>{user.name}</SheetTitle>
                            <SheetDescription>
                                Headscale user information and registered nodes.
                            </SheetDescription>

                            <div className="flex flex-wrap gap-2 pt-3">
                                <Badge variant="outline">
                                    ID: {user.id}
                                </Badge>
                                <Badge variant="secondary">
                                    {user.nodes.length} nodes
                                </Badge>
                            </div>
                        </SheetHeader>

                        <div className="flex flex-col gap-6 p-4 text-sm">
                            <section className="space-y-3">
                                <h3 className="font-semibold">
                                    User Information
                                </h3>

                                <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3">
                  <span className="text-muted-foreground">
                    Name
                  </span>
                                    <span className="font-medium">
                    {user.name}
                  </span>
                                </div>

                                <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3">
                  <span className="text-muted-foreground">
                    Created
                  </span>
                                    <span className="font-medium">
                    {formatDate(user.createdAt)}
                  </span>
                                </div>
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Registered Nodes
                                </h3>

                                {user.nodes.length ? (
                                    <div className="space-y-2">
                                        {user.nodes.map((node) => (
                                            <div
                                                key={node.id}
                                                className="rounded-lg border p-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">
                            {node.name}
                          </span>

                                                    <Badge
                                                        variant={
                                                            node.online
                                                                ? "secondary"
                                                                : "outline"
                                                        }
                                                    >
                                                        {node.online
                                                            ? "Online"
                                                            : "Offline"}
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                    {node.ipv4}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        No nodes registered to this user.
                                    </p>
                                )}
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Management Actions
                                </h3>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" disabled>
                                        Rename User
                                    </Button>

                                    <Button variant="destructive" disabled>
                                        Delete User
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

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) =>
            [user.id, user.name].some((value) =>
                value.toLowerCase().includes(query),
            ),
        );
    }, [search]);

    const selectedUser =
        users.find((user) => user.id === selectedId) ?? null;

    const usersWithNodes = users.filter(
        (user) => user.nodes.length > 0,
    ).length;

    const totalNodes = users.reduce(
        (sum, user) => sum + user.nodes.length,
        0,
    );

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Users
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage Headscale users and their registered nodes.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline">Preview Data</Badge>

                    <Button disabled>
                        <Plus className="size-4"/>
                        Create User
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: "Total Users",
                        value: users.length,
                        icon: Users,
                    },
                    {
                        label: "Users with Nodes",
                        value: usersWithNodes,
                        icon: Network,
                    },
                    {
                        label: "Registered Nodes",
                        value: totalNodes,
                        icon: UserRound,
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
                    <label className="relative block">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <span className="sr-only">Search users</span>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search users by name or ID..."
                            className="h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </label>

                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Nodes</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserRound className="size-4 text-muted-foreground"/>
                                                <span className="font-medium">
                          {user.name}
                        </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {user.id}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="secondary">
                                                {user.nodes.length}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`View ${user.name} details`}
                                                onClick={() =>
                                                    setSelectedId(user.id)
                                                }
                                            >
                                                <ChevronRight className="size-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No matching users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Showing {filteredUsers.length} of {users.length} users
                    </p>
                </CardContent>
            </Card>

            <UserDetails
                user={selectedUser}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
}