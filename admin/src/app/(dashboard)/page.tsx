import OverviewPage from "@/components/dashboard/dashboard-page";
import {listNodes} from "@/lib/api/nodes";
import {listUsers} from "@/lib/api/users";

export default async function Page() {
    const [{nodes}, {users}] = await Promise.all([
        listNodes(),
        listUsers(),
    ]);

    const path = (process.env.BASE_PATH ?? "")
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const basePath = path ? `/${path}` : "";

    return (
        <OverviewPage
            nodes={nodes}
            users={users}
            basePath={basePath}
        />
    );
}