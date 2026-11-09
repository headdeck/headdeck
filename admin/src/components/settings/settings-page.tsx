import HeadscaleConnectionCard from "@/components/settings/headscale-connection-card";
import SessionCard from "@/components/settings/session-card";
import AppearanceCard from "@/components/settings/appearance-card";
import AboutCard from "@/components/settings/about-card";

export default function SettingsPage({
                                         serverUrl,
                                     }: {
    serverUrl: string | null;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage your HeadDeck connection, session, and preferences.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <HeadscaleConnectionCard serverUrl={serverUrl}/>
                <SessionCard/>
                <AppearanceCard/>
                <AboutCard/>
            </div>
        </div>
    );
}