import {redirect} from "next/navigation";

import {auth} from "@/auth";
import SettingsPage from "@/components/settings/settings-page";

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <SettingsPage
            serverUrl={process.env.HEADSCALE_URL ?? null}
        />
    );
}