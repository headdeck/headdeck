"use client";

import {useMemo, useState} from "react";
import {ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Search, UserRound, Users,} from "lucide-react";

import {NodeSchema, UserSchema} from "@headdeck/shared";

import UserDetails from "@/components/users/user-details";
import CreateUserDialog from "@/components/users/create-user-dialog";
import Pagination from "@/components/common/pagination";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

type User = UserSchema.User;
type Node = NodeSchema.NodeSummary;

type Props = {
    users: User[];
    nodes: Node[];
};

type SortField = "name" | "id" | "createdAt";
type SortDirection = "asc" | "desc";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

export default function UsersPage({users, nodes}: Props) {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const usersWithNodes = new Set(
        nodes.map((node) => node.user.id),
    ).size;

    const totalNodes = nodes.length;

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users
            .filter((user) =>
                [
                    user.id,
                    user.name,
                    user.displayName,
                    user.email,
                ].some((value) => value.toLowerCase().includes(query)),
            )
            .sort((a, b) => {
                const result =
                    sortField === "id"
                        ? BigInt(a.id) < BigInt(b.id)
                            ? -1
                            : BigInt(a.id) > BigInt(b.id)
                                ? 1
                                : 0
                        : a[sortField].localeCompare(b[sortField]);

                return sortDirection === "asc" ? result : -result;
            });
    }, [users, search, sortField, sortDirection]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / pageSize),
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;

        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const selectedUser =
        users.find((user) => user.id === selectedId) ?? null;

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
                        Users
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage Headscale users.
                    </p>
                </div>

                <CreateUserDialog/>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Users
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums">
                                {users.length}
                            </p>
                        </div>
                        <Users className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Users with Nodes
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums">
                                {usersWithNodes}
                            </p>
                        </div>
                        <UserRound className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Registered Nodes
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums">
                                {totalNodes}
                            </p>
                        </div>
                        <UserRound className="size-5 text-muted-foreground"/>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="space-y-4">
                    <label className="relative block">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <span className="sr-only">Search users</span>
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search users by name, ID or email..."
                            className="h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </label>

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
                                            User
                                            <SortIcon field="name"/>
                                        </Button>
                                    </TableHead>

                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort("id")}
                                        >
                                            User ID
                                            <SortIcon field="id"/>
                                        </Button>
                                    </TableHead>

                                    <TableHead>Email</TableHead>

                                    <TableHead>Nodes</TableHead>

                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort("createdAt")}
                                        >
                                            Created
                                            <SortIcon field="createdAt"/>
                                        </Button>
                                    </TableHead>

                                    <TableHead className="text-right">
                                        Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedUsers.map((user) => (
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

                                        <TableCell className="text-muted-foreground">
                                            {user.email || "—"}
                                        </TableCell>

                                        <TableCell className="text-muted-foreground">
                                            <Badge variant="secondary">
                                                {nodes.filter((node) => node.user.id === user.id).length}
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
                                                onClick={() => setSelectedId(user.id)}
                                            >
                                                <ChevronRight className="size-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {paginatedUsers.length === 0 && (
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

                    <Pagination
                        page={currentPage}
                        pageSize={pageSize}
                        totalItems={filteredUsers.length}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                    />
                </CardContent>
            </Card>

            <UserDetails
                user={selectedUser}
                nodes={nodes}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
}