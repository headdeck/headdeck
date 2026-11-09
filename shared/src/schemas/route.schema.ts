import {z} from "zod";

import {NodeSchema} from "@/schemas/node.schema.js";

export const RoutePrefixSchema = z.cidrv4().or(z.cidrv6());

export const SetApprovedRoutesSchema = z.object({
    nodeId: NodeSchema.shape.id,
    routes: z.array(RoutePrefixSchema),
});

export const SetApprovedRoutesResponseSchema = z.object({
    node: NodeSchema.extend({
        user: NodeSchema.shape.user.nullable(),
    }),
});

export type RoutePrefix = z.infer<typeof RoutePrefixSchema>;

export type SetApprovedRoutes = z.infer<typeof SetApprovedRoutesSchema>;

export type SetApprovedRoutesResponse = z.infer<
    typeof SetApprovedRoutesResponseSchema
>;