import PreauthKeysPage from "@/components/preauth-keys/preauth-keys-page";

import {listPreAuthKeys} from "@/lib/api/pre-auth-keys";
import {listUsers} from "@/lib/api/users";
import {listAvailablePolicyTags} from "@/lib/api/policy-tags";

export default async function Page() {
    const [
        {preAuthKeys},
        {users},
        availableTags,
    ] = await Promise.all([
        listPreAuthKeys(),
        listUsers(),
        listAvailablePolicyTags(),
    ]);

    return (
        <PreauthKeysPage
            keys={preAuthKeys}
            users={users}
            availableTags={availableTags}
        />
    );
}