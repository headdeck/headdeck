"use client";

import {NodeSchema} from "@headdeck/shared";

import RenameNodeDialog from "@/components/nodes/rename-node-dialog";
import ExpireNodeDialog from "@/components/nodes/expire-node-dialog";
import EditNodeTagsDialog from "@/components/nodes/edit-node-tags-dialog";
import DeleteNodeDialog from "@/components/nodes/delete-node-dialog";
import RouteManagementDialog from "@/components/nodes/route-management-dialog";
import {Badge} from "@/components/ui/badge";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";
import {getNodeStatusBadge} from "@/components/nodes/node-status";

type Node = NodeSchema.NodeSummary;

type Props = {
    node: Node | null;
    onClose: () => void;
    availableTags: string[];
};

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

export default function NodeDetails({node, onClose, availableTags}: Props) {
    const ipv4 = node?.ipAddresses.find((ip) => ip.includes(".")) ?? "—";
    const ipv6 = node?.ipAddresses.find((ip) => ip.includes(":")) ?? "—";

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
                                {node.givenName || node.name}
                            </SheetTitle>
                            <SheetDescription>
                                View node information and management options.
                            </SheetDescription>

                            <div className="flex flex-wrap items-center gap-2 pt-3">
                                {getNodeStatusBadge(node)}

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
                                    ["Hostname", node.name],
                                    ["User", node.user.name],
                                    ["IPv4", ipv4],
                                    ["IPv6", ipv6],
                                    ["Registered", formatDate(node.createdAt)],
                                    ["Last Seen", formatDate(node.lastSeen)],
                                    ["Expires", node.expiry ? formatDate(node.expiry) : "Never"],
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
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="font-semibold">
                                        Available Routes
                                    </h3>

                                    {node.availableRoutes.length > 0 && (
                                        <RouteManagementDialog
                                            key={`routes-${node.id}`}
                                            node={node}
                                        />
                                    )}
                                </div>

                                {node.availableRoutes.length ? (
                                    node.availableRoutes.map((route) => {
                                        const approved = node.approvedRoutes.includes(route);

                                        return (
                                            <div
                                                key={route}
                                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                                            >
                                                <code className="break-all text-xs">
                                                    {route}
                                                </code>

                                                <Badge variant={approved ? "secondary" : "outline"}>
                                                    {approved ? "Approved" : "Not approved"}
                                                </Badge>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-muted-foreground">
                                        No available routes.
                                    </p>
                                )}
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Management Actions
                                </h3>

                                <div className="grid grid-cols-2 gap-2">
                                    <RenameNodeDialog
                                        key={`rename-${node.id}`}
                                        node={node}
                                        onSuccess={onClose}
                                    />

                                    <EditNodeTagsDialog
                                        key={`tags-${node.id}`}
                                        node={node}
                                        onSuccess={onClose}
                                        availableTags={availableTags}
                                    />

                                    <ExpireNodeDialog
                                        key={`expire-${node.id}`}
                                        node={node}
                                        onSuccess={onClose}
                                    />

                                    <DeleteNodeDialog
                                        key={node.id}
                                        node={node}
                                        onSuccess={onClose}
                                    />
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}