import {listUsers} from "@/lib/api/users";
import {listNodeSummaries} from "@/lib/api/nodes";
import UsersPage from "@/components/users/users-page";

export default async function Page() {
    const [{users}, nodes] = await Promise.all([
        listUsers(),
        listNodeSummaries(),
    ]);

    return <UsersPage users={users} nodes={nodes}/>;
}