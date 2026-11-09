"use client";

import {useState} from "react";
import {Clock3, ShieldCheck, Trash2} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";
import type {ApiKey} from "./api-key-utils";
import {formatDate, isExpired} from "./api-key-utils";
import ExpireApiKeyDialog from "./expire-api-key-dialog";
import DeleteApiKeyDialog from "./delete-api-key-dialog";

type Props = {
    apiKey: ApiKey | null;
    now: number;
    isCurrentKey: boolean;
    onClose: () => void;
    onChanged: () => void;
};

export default function ApiKeyDetails({
                                          apiKey,
                                          onClose,
                                          isCurrentKey,
                                          onChanged,
                                          now
                                      }: Props) {
    const [expireOpen, setExpireOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const expired = apiKey
        ? isExpired(apiKey, now)
        : false;

    function success() {
        setExpireOpen(false);
        setDeleteOpen(false);
        onChanged();
    }

    return (
        <>
            <Sheet
                open={apiKey !== null}
                onOpenChange={(open) => {
                    if (!open && !expireOpen && !deleteOpen) {
                        onClose();
                    }
                }}
            >
                <SheetContent className="overflow-y-auto">
                    {apiKey && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="break-all font-mono">
                                    {apiKey.prefix}
                                </SheetTitle>
                                <SheetDescription>
                                    API key information and management options.
                                </SheetDescription>
                                <div className="pt-2">
                                    <Badge variant="outline">
                                        {expired ? "Expired" : "Active"}
                                    </Badge>
                                </div>
                            </SheetHeader>

                            <div className="space-y-6 px-4 pb-6">
                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold">
                                        Key Information
                                    </h3>

                                    <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 text-sm">
                                        <span className="text-muted-foreground">ID</span>
                                        <span>{apiKey.id}</span>

                                        <span className="text-muted-foreground">Prefix</span>
                                        <span className="break-all font-mono">
                                            {apiKey.prefix}
                                        </span>

                                        <span className="text-muted-foreground">Created</span>
                                        <span>{formatDate(apiKey.createdAt)}</span>

                                        <span className="text-muted-foreground">Expires</span>
                                        <span>{formatDate(apiKey.expiration)}</span>

                                        <span className="text-muted-foreground">Last Seen</span>
                                        <span>{formatDate(apiKey.lastSeen)}</span>
                                    </div>
                                </section>

                                <div className="border-t pt-5">
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0"/>
                                        <p>
                                            Headscale does not expose the
                                            complete secret when listing
                                            existing API keys.
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
                                        disabled={expired || isCurrentKey}
                                        onClick={() => setExpireOpen(true)}
                                    >
                                        <Clock3 className="size-4"/>
                                        Expire API Key
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full text-destructive"
                                        disabled={isCurrentKey}
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        <Trash2 className="size-4"/>
                                        Delete API Key
                                    </Button>

                                    {isCurrentKey && (
                                        <p className="text-xs text-muted-foreground">
                                            This API key is used by your current session.
                                            Expiration and deletion are disabled to prevent
                                            losing access to Headscale.
                                        </p>
                                    )}
                                </section>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <ExpireApiKeyDialog
                apiKey={expireOpen ? apiKey : null}
                onClose={() => setExpireOpen(false)}
                onSuccess={success}
            />

            <DeleteApiKeyDialog
                apiKey={deleteOpen ? apiKey : null}
                onClose={() => setDeleteOpen(false)}
                onSuccess={success}
            />
        </>
    );
}