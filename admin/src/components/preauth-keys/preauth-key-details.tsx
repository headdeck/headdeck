"use client";

import {Check, ShieldCheck, XCircle} from "lucide-react";

import {PreAuthKeySchema} from "@headdeck/shared";

import ExpirePreAuthKeyDialog from "@/components/preauth-keys/expire-preauth-key-dialog";
import DeletePreAuthKeyDialog from "@/components/preauth-keys/delete-preauth-key-dialog";

import {Badge} from "@/components/ui/badge";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";

type PreAuthKey = PreAuthKeySchema.PreAuthKey;

type Props = {
    selectedKey: PreAuthKey | null;
    onClose: () => void;
    onSuccess: (expiredKeyId: string) => void;
    onDeleteSuccess: (deletedKeyId: string) => void;
};

type KeyStatus = "active" | "used" | "expired";

function getStatus(key: PreAuthKey): KeyStatus {
    if (new Date(key.expiration).getTime() <= Date.now()) {
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

export default function PreAuthKeyDetails({
                                              selectedKey,
                                              onClose,
                                              onSuccess,
                                              onDeleteSuccess,
                                          }: Props) {
    const status = selectedKey ? getStatus(selectedKey) : null;

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
                {selectedKey && status && (
                    <>
                        <SheetHeader className="border-b">
                            <SheetTitle>
                                Pre-auth Key #{selectedKey.id}
                            </SheetTitle>

                            <SheetDescription>
                                Registration key information and settings.
                            </SheetDescription>

                            <div className="flex flex-wrap gap-2 pt-3">
                                <StatusBadge status={status}/>

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
                                    ["Key", selectedKey.key],
                                    [
                                        "User",
                                        selectedKey.user?.name ?? "Unknown",
                                    ],
                                    [
                                        "Reusable",
                                        selectedKey.reusable ? "Yes" : "No",
                                    ],
                                    [
                                        "Ephemeral",
                                        selectedKey.ephemeral ? "Yes" : "No",
                                    ],
                                    [
                                        "Used",
                                        selectedKey.used ? "Yes" : "No",
                                    ],
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
                                    {selectedKey.aclTags.length > 0 ? (
                                        selectedKey.aclTags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                            >
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

                                {status === "active" && (
                                    <ExpirePreAuthKeyDialog
                                        key={selectedKey.id}
                                        keyData={selectedKey}
                                        onSuccess={onSuccess}
                                    />
                                )}

                                {status !== "active" && (
                                    <p className="text-sm text-muted-foreground">
                                        This key is no longer valid for new registrations.
                                    </p>
                                )}

                                <DeletePreAuthKeyDialog
                                    key={selectedKey.id}
                                    keyData={selectedKey}
                                    onSuccess={onDeleteSuccess}
                                />
                            </section>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}