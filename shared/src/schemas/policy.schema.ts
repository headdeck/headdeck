import {z} from "zod";

// Common policy values

export const PolicyPrincipalSchema = z.string().min(1);

export const PolicyAliasSchema = z.string().min(1);

export const PolicyPortSchema = z.union([
    z.string(),
    z.number().int().min(0).max(65535),
]);

// Legacy ACL rules

export const PolicyACLRuleSchema = z.looseObject({
    action: z.literal("accept"),
    proto: z.string().optional(),
    src: z.array(PolicyPrincipalSchema),
    dst: z.array(z.string()),
});

// Modern grants

export const PolicyGrantSchema = z.looseObject({
    src: z.array(PolicyPrincipalSchema),
    dst: z.array(PolicyAliasSchema),
    ip: z.array(z.string()).optional(),
    app: z.record(z.string(), z.unknown()).optional(),
    via: z.array(z.string()).optional(),
});

// SSH policy

export const PolicySSHRuleSchema = z.looseObject({
    action: z.literal("accept"),
    src: z.array(PolicyPrincipalSchema),
    dst: z.array(PolicyAliasSchema),
    users: z.array(z.string()),
    checkPeriod: z.string().optional(),
});

// Network attributes

export const PolicyNodeAttributeSchema = z.looseObject({
    target: z.array(PolicyAliasSchema),
    attr: z.array(z.string()),
});

// Policy definitions

export const PolicyGroupsSchema = z.record(
    z.string(),
    z.array(PolicyPrincipalSchema),
);

export const PolicyTagOwnersSchema = z.record(
    z.string().regex(/^tag:/),
    z.array(PolicyPrincipalSchema),
);

export const PolicyHostsSchema = z.record(
    z.string(),
    z.string(),
);

export const PolicyAutoApproversSchema = z.looseObject({
    routes: z.record(
        z.string(),
        z.array(PolicyPrincipalSchema),
    ).optional(),
    exitNode: z.array(PolicyPrincipalSchema).optional(),
});

// Full policy document

export const PolicyDocumentSchema = z.looseObject({
    groups: PolicyGroupsSchema.optional(),
    hosts: PolicyHostsSchema.optional(),
    tagOwners: PolicyTagOwnersSchema.optional(),
    autoApprovers: PolicyAutoApproversSchema.optional(),

    acls: z.array(PolicyACLRuleSchema).optional(),
    grants: z.array(PolicyGrantSchema).optional(),
    ssh: z.array(PolicySSHRuleSchema).optional(),
    nodeAttrs: z.array(PolicyNodeAttributeSchema).optional(),

    tests: z.array(z.unknown()).optional(),
    sshTests: z.array(z.unknown()).optional(),
});

// Headscale REST API schemas

export const GetPolicyResponseSchema = z.object({
    policy: z.string(),
    updatedAt: z.iso.datetime({offset: true}).optional(),
});

export const SetPolicySchema = z.object({
    policy: z.string().min(1, "Policy document is required"),
});

export const SetPolicyResponseSchema = z.object({
    policy: z.string(),
    updatedAt: z.iso.datetime({offset: true}).optional(),
});

// Derived schemas for HeadDeck

export const AvailablePolicyTagsSchema = z.array(
    z.string().regex(/^tag:/),
);

// Types

export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;
export type PolicyACLRule = z.infer<typeof PolicyACLRuleSchema>;
export type PolicyGrant = z.infer<typeof PolicyGrantSchema>;
export type PolicySSHRule = z.infer<typeof PolicySSHRuleSchema>;
export type PolicyNodeAttribute = z.infer<typeof PolicyNodeAttributeSchema>;
export type PolicyAutoApprovers = z.infer<typeof PolicyAutoApproversSchema>;

export type GetPolicyResponse = z.infer<typeof GetPolicyResponseSchema>;
export type SetPolicy = z.infer<typeof SetPolicySchema>;
export type SetPolicyResponse = z.infer<typeof SetPolicyResponseSchema>;
export type AvailablePolicyTags = z.infer<typeof AvailablePolicyTagsSchema>;