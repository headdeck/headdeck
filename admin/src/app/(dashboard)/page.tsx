import OverviewPage from "@/components/dashboard/dashboard-page";
import {listNodes} from "@/lib/api/nodes";
import {listUsers} from "@/lib/api/users";

export default async function Page() {
    const [{nodes}, {users}] = await Promise.all([
        listNodes(),
        listUsers(),
    ]);

    return (
        <OverviewPage
            nodes={nodes}
            users={users}
        />
    );
}