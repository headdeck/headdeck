import type {UserSchema} from "@headdeck/shared";

export function getPolicyUserPrincipal(
    user: UserSchema.User,
): string {
    if (!user.email && !user.provider) {
        return `${user.name}@`;
    }

    return user.email || user.name;
}