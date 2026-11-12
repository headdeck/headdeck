import {listNodeSummaries} from "@/lib/api/nodes";
import {listAvailablePolicyTags} from "@/lib/api/policy-tags";
import {listUsers} from "@/lib/api/users";

import NodesPage from "@/components/nodes/nodes-page";

export default async function Page() {
    const [nodes, availableTags, {users}] = await Promise.all([
        listNodeSummaries(),
        listAvailablePolicyTags(),
        listUsers(),
    ]);

    const externalUrl = (
        process.env.HEADSCALE_EXTERNAL_URL?.trim()
        || process.env.HEADSCALE_URL?.trim()
        || ""
    ).replace(/\/+$/, "");

    const usingFallback = !process.env.HEADSCALE_EXTERNAL_URL?.trim();

    return (
        <NodesPage
            nodes={nodes}
            availableTags={availableTags}
            users={users}
            externalUrl={externalUrl}
            usingFallback={usingFallback}
        />
    );
}