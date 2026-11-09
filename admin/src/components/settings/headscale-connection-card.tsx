"use client";

import {useState} from "react";
import {Server, Wifi} from "lucide-react";

import {testHeadscaleConnectionAction} from "@/app/(dashboard)/settings/actions";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

type ConnectionStatus = "untested" | "connected" | "failed";

export default function HeadscaleConnectionCard({
                                                    serverUrl,
                                                }: {
    serverUrl: string | null;
}) {
    const [status, setStatus] = useState<ConnectionStatus>("untested");
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleTestConnection() {
        setTesting(true);
        setError(null);
        setStatus("untested");

        try {
            const result = await testHeadscaleConnectionAction();

            if (result.success) {
                setStatus("connected");
            } else {
                setStatus("failed");
                setError(result.error);
            }
        } catch {
            setStatus("failed");
            setError("Unable to complete the connection test.");
        } finally {
            setTesting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Server className="size-4 text-muted-foreground"/>
                    <CardTitle>Headscale Connection</CardTitle>
                </div>
                <CardDescription>
                    Information about your connected Headscale server.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Connection
                    </span>
                    <Badge variant="outline">
                        {testing
                            ? "Testing..."
                            : status === "connected"
                                ? "Connected"
                                : status === "failed"
                                    ? "Connection failed"
                                    : "Not tested"}
                    </Badge>
                </div>

                <Separator/>

                <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0 text-sm text-muted-foreground">
                        Server URL
                    </span>
                    <span className="min-w-0 break-all text-right text-sm">
                        {serverUrl ?? "Not configured"}
                    </span>
                </div>

                <Separator/>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Authentication
                    </span>
                    <span className="text-sm">API Key</span>
                </div>

                <div className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={testing || !serverUrl}
                        onClick={handleTestConnection}
                    >
                        <Wifi className="size-4"/>
                        {testing ? "Testing..." : "Test Connection"}
                    </Button>
                </div>

                {error && (
                    <p role="alert" className="text-xs text-destructive">
                        {error}
                    </p>
                )}

                <p className="text-xs text-muted-foreground">
                    The Headscale server is configured by the administrator
                    through the HEADSCALE_URL environment variable.
                </p>
            </CardContent>
        </Card>
    );
}