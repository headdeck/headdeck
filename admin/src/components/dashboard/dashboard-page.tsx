import Link from "next/link";
import {Activity, ArrowRight, CheckCircle2, Clock3, Network, Route, Users, Wifi, WifiOff,} from "lucide-react";

import {NodeSchema, UserSchema} from "@headdeck/shared";

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

type Props = {
    nodes: NodeSchema.Node[];
    users: UserSchema.User[];
    basePath: string;
};

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

function getNodeName(node: NodeSchema.Node): string {
    return node.givenName || node.name;
}

function getNodeIPv4(node: NodeSchema.Node): string {
    return node.ipAddresses.find((address) =>
        address.includes("."),
    ) ?? node.ipAddresses[0] ?? "—";
}

export default function OverviewPage({nodes, users, basePath}: Props) {
    const withBasePath = (path: string) => `${basePath}${path}`;

    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter((node) => node.online).length;
    const offlineNodes = totalNodes - onlineNodes;

    const approvedRoutes = nodes.reduce(
        (total, node) => total + node.approvedRoutes.length,
        0,
    );

    const onlinePercentage =
        totalNodes > 0
            ? (onlineNodes / totalNodes) * 100
            : 0;

    const recentNodes = [...nodes]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

    const metrics = [
        {
            title: "Total Nodes",
            value: totalNodes,
            description: "Registered devices",
            icon: Network,
        },
        {
            title: "Online Nodes",
            value: onlineNodes,
            description: "Currently connected",
            icon: Wifi,
        },
        {
            title: "Users",
            value: users.length,
            description: "Headscale users",
            icon: Users,
        },
        {
            title: "Approved Routes",
            value: approvedRoutes,
            description: "Approved subnet routes",
            icon: Route,
        },
    ];

    const managementLinks = [
        {
            title: "Manage Nodes",
            description: "Devices, tags and routes",
            href: "/nodes",
            icon: Network,
        },
        {
            title: "Manage Users",
            description: "Headscale user accounts",
            href: "/users",
            icon: Users,
        },
        {
            title: "Access Policies",
            description: "Network access rules",
            href: "/access-policies",
            icon: Route,
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Overview
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Monitor and manage your Headscale network.
                    </p>
                </div>

                <Badge variant="outline">
                    <Activity className="size-3.5"/>
                    Headscale Data
                </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <Card key={metric.title}>
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <CardDescription>
                                    {metric.title}
                                </CardDescription>
                                <Icon className="size-4 text-muted-foreground"/>
                            </CardHeader>

                            <CardContent>
                                <div className="text-3xl font-semibold tabular-nums">
                                    {metric.value}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {metric.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Node Status</CardTitle>
                        <CardDescription>
                            Current node connectivity summary.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-3xl font-semibold tabular-nums">
                                    {onlinePercentage.toFixed(1)}%
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Nodes online
                                </p>
                            </div>

                            <Wifi className="size-8 text-emerald-500"/>
                        </div>

                        <div
                            role="progressbar"
                            aria-label="Online nodes"
                            aria-valuenow={onlineNodes}
                            aria-valuemin={0}
                            aria-valuemax={totalNodes}
                            className="h-2 overflow-hidden rounded-full bg-muted"
                        >
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{width: `${onlinePercentage}%`}}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <CheckCircle2 className="size-5 text-emerald-500"/>
                                <div>
                                    <p className="text-lg font-semibold tabular-nums">
                                        {onlineNodes}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Online
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <WifiOff className="size-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-lg font-semibold tabular-nums">
                                        {offlineNodes}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Offline
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Network Management</CardTitle>
                        <CardDescription>
                            Quick access to Headscale administration.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2">
                        {managementLinks.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={withBasePath(item.href)}
                                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                                >
                                    <Icon className="size-5 shrink-0 text-muted-foreground"/>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>

                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground"/>
                                </Link>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Recently Registered Nodes</CardTitle>
                        <CardDescription className="mt-1">
                            Devices ordered by registration date.
                        </CardDescription>
                    </div>

                    <Link
                        href={withBasePath("/nodes")}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
                    >
                        View all
                        <ArrowRight className="size-4"/>
                    </Link>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Node</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Registered</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {recentNodes.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No registered nodes found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentNodes.map((node) => (
                                    <TableRow key={node.id}>
                                        <TableCell className="font-medium">
                                            {getNodeName(node)}
                                        </TableCell>

                                        <TableCell>
                                            {node.user?.name ?? "Unknown"}
                                        </TableCell>

                                        <TableCell className="font-mono text-xs">
                                            {getNodeIPv4(node)}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={
                                                    node.online
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {node.online ? (
                                                    <Wifi className="size-3 text-emerald-500"/>
                                                ) : (
                                                    <WifiOff className="size-3"/>
                                                )}
                                                {node.online ? "Online" : "Offline"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                                <Clock3 className="size-3.5"/>
                                                {formatDate(node.createdAt)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}