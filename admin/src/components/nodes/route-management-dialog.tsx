"use client";

import {useEffect, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {NodeSchema, RouteSchema} from "@headdeck/shared";
import {Network} from "lucide-react";

import {setApprovedRoutesAction} from "@/app/(dashboard)/routes/actions";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Node = NodeSchema.NodeSummary;

type Props = {
    node: Node;
};

export default function RouteManagementDialog({node}: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const availableRoutes = node.availableRoutes;

    useEffect(() => {
        if (!open) return;

        setSelectedRoutes([...node.approvedRoutes]);
        setError(null);
    }, [open, node.approvedRoutes]);

    function toggleRoute(route: string, checked: boolean) {
        setSelectedRoutes((current) => {
            if (checked) {
                return [...new Set([...current, route])];
            }

            return current.filter((value) => value !== route);
        });

        setError(null);
    }

    const hasChanges =
        selectedRoutes.length !== node.approvedRoutes.length ||
        selectedRoutes.some(
            (route) => !node.approvedRoutes.includes(route),
        );

    function handleSave() {
        if (!hasChanges || pending) return;

        const parsed = RouteSchema.SetApprovedRoutesSchema.safeParse({
            nodeId: node.id,
            routes: selectedRoutes,
        });

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]?.message ??
                "Invalid route configuration.",
            );
            return;
        }

        startTransition(async () => {
            const result = await setApprovedRoutesAction(parsed.data);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setOpen(false);
            router.refresh();
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="outline" size="sm">
                        <Network className="size-4"/>
                        Manage Routes
                    </Button>
                }/>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Manage Routes</DialogTitle>

                    <DialogDescription>
                        Select which advertised routes are approved
                        for {node.givenName || node.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {availableRoutes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            This node is not advertising any routes.
                        </p>
                    ) : (
                        availableRoutes.map((route) => {
                            const approved = selectedRoutes.includes(route);

                            return (
                                <label
                                    key={route}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={approved}
                                        disabled={pending}
                                        onChange={(event) =>
                                            toggleRoute(
                                                route,
                                                event.target.checked,
                                            )
                                        }
                                        className="size-4 accent-primary"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <code className="break-all text-xs">
                                            {route}
                                        </code>
                                    </div>

                                    <Badge
                                        variant={
                                            approved ? "secondary" : "outline"
                                        }
                                    >
                                        {approved ? "Approved" : "Not approved"}
                                    </Badge>
                                </label>
                            );
                        })
                    )}

                    <p className="text-xs text-muted-foreground">
                        Saving replaces the node's approved route list.
                        Unselected routes will no longer be approved.
                    </p>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={pending}
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={!hasChanges || pending}
                        onClick={handleSave}
                    >
                        {pending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}