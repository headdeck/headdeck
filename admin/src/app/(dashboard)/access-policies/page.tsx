import AccessPoliciesPage from "@/components/access-policies/access-policies-page";
import {getPolicy} from "@/lib/api/policy";
import {listUsers} from "@/lib/api/users";

export default async function Page() {
    const [policy, usersResponse] = await Promise.all([
        getPolicy(),
        listUsers(),
    ]);

    return (
        <AccessPoliciesPage
            initialPolicy={policy.policy}
            updatedAt={policy.updatedAt ?? null}
            users={usersResponse.users}
        />
    );
}