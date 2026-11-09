"use client";

import {NodeSchema, UserSchema} from "@headdeck/shared";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";

import RenameUserDialog from "@/components/users/rename-user-dialog";
import DeleteUserDialog from "@/components/users/delete-user-dialog";

type Props = {
    user: UserSchema.User | null;
    nodes: NodeSchema.NodeSummary[];
    onClose: () => void;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

export default function UserDetails({user, nodes, onClose}: Props) {
    const userNodes = user
        ? nodes.filter((node) => node.user.id === user.id)
        : [];

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
                                    {userNodes.length} nodes
                                </Badge>
                            </div>
                        </SheetHeader>

                        <div className="flex flex-col gap-6 p-4 text-sm">
                            <section className="space-y-3">
                                <h3 className="font-semibold">
                                    User Information
                                </h3>

                                {[
                                    ["Name", user.name],
                                    ["Display Name", user.displayName],
                                    ["Email", user.email],
                                    ["Provider", user.provider],
                                    ["Provider ID", user.providerId],
                                    ["Created", formatDate(user.createdAt)],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid grid-cols-[110px_minmax(0,1fr)] gap-3"
                                    >
                                        <span className="text-muted-foreground">
                                            {label}
                                        </span>
                                        <span className="break-all font-medium">
                                            {value || "—"}
                                        </span>
                                    </div>
                                ))}
                            </section>

                            <section className="space-y-3 border-t pt-5">
                                <h3 className="font-semibold">
                                    Registered Nodes
                                </h3>

                                {userNodes.length > 0 ? (
                                    <div className="space-y-2">
                                        {userNodes.map((node) => (
                                            <div
                                                key={node.id}
                                                className="rounded-lg border p-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="font-medium">
                                                        {node.givenName || node.name}
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

                                                <div className="mt-2 space-y-1">
                                                    {node.ipAddresses.map((ip) => (
                                                        <p
                                                            key={ip}
                                                            className="break-all font-mono text-xs text-muted-foreground"
                                                        >
                                                            {ip}
                                                        </p>
                                                    ))}
                                                </div>
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
                                    <RenameUserDialog
                                        key={`rename-${user.id}`}
                                        user={user}
                                        onSuccess={onClose}
                                    />

                                    <DeleteUserDialog
                                        key={`delete-${user.id}`}
                                        user={user}
                                        nodeCount={userNodes.length}
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