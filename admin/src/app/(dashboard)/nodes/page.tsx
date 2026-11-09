import {listNodeSummaries} from "@/lib/api/nodes";
import {listAvailablePolicyTags} from "@/lib/api/policy-tags";
import NodesPage from "@/components/nodes/nodes-page";

export default async function Page() {
    const [nodes, availableTags] = await Promise.all([
        listNodeSummaries(),
        listAvailablePolicyTags(),
    ]);

    return <NodesPage nodes={nodes} availableTags={availableTags}/>;
}