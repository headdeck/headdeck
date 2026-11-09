import {Wifi, WifiOff, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";

export type NodeStatus = "online" | "offline" | "expired";

export function getNodeStatus(node: {
    online: boolean;
    expiry: string | null;
}): NodeStatus {
    if (node.expiry !== null) {
        const expiryTime = Date.parse(node.expiry);

        if (Number.isFinite(expiryTime) && expiryTime <= Date.now()) {
            return "expired";
        }
    }

    return node.online ? "online" : "offline";
}

export function getNodeStatusBadge(node: {
    online: boolean;
    expiry: string | null;
}) {
    if (node.expiry !== null) {
        const expiryTime = Date.parse(node.expiry);

        if (Number.isFinite(expiryTime) && expiryTime <= Date.now()) {
            return <Badge variant={"destructive"}>
                <X className="size-3"/>
                Expired
            </Badge>;
        }
    }

    return <Badge variant={node.online ? "secondary" : "outline"}>
        {node.online ? (
            <Wifi className="size-3 text-emerald-500"/>
        ) : (
            <WifiOff className="size-3"/>
        )}
        {node.online ? "Online" : "Offline"}
    </Badge>;
}