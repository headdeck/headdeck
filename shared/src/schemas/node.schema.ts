import {z} from "zod";

import {UserSchema} from "@/schemas/user.schema.js";
import {PreAuthKeySchema} from "@/schemas/pre-auth-key.schema.js";

export const NodeSchema = z.object({
    id: z.string(),
    machineKey: z.string(),
    nodeKey: z.string(),
    discoKey: z.string(),
    ipAddresses: z.array(z.string()),
    name: z.string(),
    user: UserSchema,
    lastSeen: z.iso.datetime({offset: true}).nullable(),
    expiry: z.iso.datetime({offset: true}).nullable(),
    preAuthKey: PreAuthKeySchema.optional(),
    createdAt: z.iso.datetime({offset: true}),
    registerMethod: z.string(),
    givenName: z.string(),
    online: z.boolean(),
    approvedRoutes: z.array(z.string()),
    availableRoutes: z.array(z.string()),
    subnetRoutes: z.array(z.string()),
    tags: z.array(z.string()),
});

export const ListNodesResponseSchema = z.object({
    nodes: z.array(NodeSchema),
});

export const NodeSummarySchema = NodeSchema.pick({
    id: true,
    name: true,
    givenName: true,
    user: true,
    ipAddresses: true,
    online: true,
    lastSeen: true,
    expiry: true,
    createdAt: true,
    tags: true,
    approvedRoutes: true,
    availableRoutes: true,
    subnetRoutes: true,
});

export const RenameNodeSchema = z.object({
    id: NodeSchema.shape.id,
    newName: z.string()
        .trim()
        .min(1, "Node name is required")
        .max(63, "Node name is too long")
        .regex(
            /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
            "Use lowercase letters, numbers, and internal hyphens",
        ),
});

export const ExpireNodeSchema = z.object({
    id: NodeSchema.shape.id,
});

export const RenameNodeResponseSchema = z.object({
    node: NodeSchema,
});

export const ExpireNodeResponseSchema = z.object({
    node: NodeSchema,
});

export const SetNodeTagsSchema = z.object({
    id: NodeSchema.shape.id,
    tags: z.array(
        z.string()
            .trim()
            .regex(
                /^tag:[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                "Tags must use the format tag:name",
            ),
    ).refine(
        (tags) => new Set(tags).size === tags.length,
        "Duplicate tags are not allowed",
    ),
});

export const SetNodeTagsResponseSchema = z.object({
    node: NodeSchema.extend({
        user: UserSchema.nullable(),
    }),
});

export const DeleteNodeSchema = z.object({
    id: NodeSchema.shape.id,
});

export const DeleteNodeResponseSchema = z.object({});

export type DeleteNode = z.infer<typeof DeleteNodeSchema>;
export type DeleteNodeResponse = z.infer<typeof DeleteNodeResponseSchema>;
export type SetNodeTags = z.infer<typeof SetNodeTagsSchema>;
export type RenameNode = z.infer<typeof RenameNodeSchema>;
export type ExpireNode = z.infer<typeof ExpireNodeSchema>;
export type NodeSummary = z.infer<typeof NodeSummarySchema>;
export type PreAuthKey = z.infer<typeof PreAuthKeySchema>;
export type Node = z.infer<typeof NodeSchema>;
export type ListNodesResponse = z.infer<typeof ListNodesResponseSchema>;