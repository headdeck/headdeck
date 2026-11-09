import "server-only";

import {z} from "zod";
import {NodeSchema} from "@headdeck/shared";

import {headscaleRequest} from "@/lib/api/headscale-client";

export async function listNodes(): Promise<NodeSchema.ListNodesResponse> {
    return headscaleRequest(
        "/api/v1/node",
        NodeSchema.ListNodesResponseSchema,
    );
}

export async function listNodeSummaries(): Promise<NodeSchema.NodeSummary[]> {
    const {nodes} = await listNodes();

    return nodes.map((node) =>
        NodeSchema.NodeSummarySchema.parse(node),
    );
}

export async function renameNode(
    input: NodeSchema.RenameNode,
): Promise<z.infer<typeof NodeSchema.RenameNodeResponseSchema>> {
    const {id, newName} = NodeSchema.RenameNodeSchema.parse(input);

    return headscaleRequest(
        `/api/v1/node/${encodeURIComponent(id)}/rename/${encodeURIComponent(newName)}`,
        NodeSchema.RenameNodeResponseSchema,
        {
            method: "POST",
        },
    );
}

export async function expireNode(
    input: NodeSchema.ExpireNode,
): Promise<z.infer<typeof NodeSchema.ExpireNodeResponseSchema>> {
    const {id} = NodeSchema.ExpireNodeSchema.parse(input);

    return headscaleRequest(
        `/api/v1/node/${encodeURIComponent(id)}/expire`,
        NodeSchema.ExpireNodeResponseSchema,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        },
    );
}

export async function setNodeTags(
    input: NodeSchema.SetNodeTags,
): Promise<z.infer<typeof NodeSchema.SetNodeTagsResponseSchema>> {
    const {id, tags} = NodeSchema.SetNodeTagsSchema.parse(input);

    return headscaleRequest(
        `/api/v1/node/${encodeURIComponent(id)}/tags`,
        NodeSchema.SetNodeTagsResponseSchema,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({tags}),
        },
    );
}

export async function deleteNode(
    input: NodeSchema.DeleteNode,
): Promise<NodeSchema.DeleteNodeResponse> {
    const {id} = NodeSchema.DeleteNodeSchema.parse(input);

    return headscaleRequest(
        `/api/v1/node/${encodeURIComponent(id)}`,
        NodeSchema.DeleteNodeResponseSchema,
        {
            method: "DELETE",
        },
    );
}