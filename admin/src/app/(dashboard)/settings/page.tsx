"use client";

import {useTheme} from "next-themes";
import {
    ExternalLink,
    Info,
    KeyRound,
    LogOut,
    Monitor,
    Moon,
    Palette,
    Server,
    ShieldCheck,
    Sun,
    Wifi,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";
import {useEffect, useState} from "react";

const themes = [
    {value: "light", label: "Light", icon: Sun},
    {value: "dark", label: "Dark", icon: Moon},
    {value: "system", label: "System", icon: Monitor},
] as const;

export default function SettingsPage() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                            <Badge variant="outline">Not connected</Badge>
                        </div>

                        <Separator/>

                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Server URL
              </span>
                            <span className="text-sm">Not configured</span>
                        </div>

                        <Separator/>

                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Authentication
              </span>
                            <span className="text-sm">API Key</span>
                        </div>

                        <div className="pt-2">
                            <Button variant="outline" disabled>
                                <Wifi className="size-4"/>
                                Test Connection
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            The Headscale server is configured by the administrator
                            through the HEADSCALE_URL environment variable.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-muted-foreground"/>
                            <CardTitle>Session & Authentication</CardTitle>
                        </div>
                        <CardDescription>
                            Manage your authenticated HeadDeck session.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Session
              </span>
                            <Badge variant="outline">Preview Mode</Badge>
                        </div>

                        <Separator/>

                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Authentication method
              </span>
                            <span className="flex items-center gap-2 text-sm">
                <KeyRound className="size-3.5 text-muted-foreground"/>
                Headscale API Key
              </span>
                        </div>

                        <Separator/>

                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Credential visibility
              </span>
                            <span className="text-sm">Hidden</span>
                        </div>

                        <div className="pt-2">
                            <Button variant="outline" disabled>
                                <LogOut className="size-4"/>
                                Sign Out
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Secure session management will be implemented
                            during authentication integration.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="size-4 text-muted-foreground"/>
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>
                            Customize how HeadDeck looks on your device.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Theme</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Choose a theme or follow your system preference.
                            </p>
                        </div>

                        {!mounted ? (
                            <Skeleton className="h-10 w-full"/>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {themes.map((option) => {
                                    const Icon = option.icon;
                                    const selected = theme === option.value;

                                    return (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant={selected ? "default" : "outline"}
                                            aria-pressed={selected}
                                            onClick={() => setTheme(option.value)}
                                        >
                                            <Icon className="size-4"/>
                                            {option.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Your theme preference is saved locally in this browser.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Info className="size-4 text-muted-foreground"/>
                            <CardTitle>About HeadDeck</CardTitle>
                        </div>
                        <CardDescription>
                            Project information and community resources.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                              <span className="text-sm text-muted-foreground">
                                Application
                              </span>
                            <span className="text-sm font-medium">HeadDeck</span>
                        </div>

                        <Separator/>

                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Version
              </span>
                            <Badge variant="outline">
                                v{process.env.NEXT_PUBLIC_APP_VERSION}
                            </Badge>
                        </div>

                        <Separator/>

                        <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Project
              </span>
                            <span className="text-sm">Open Source</span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                variant="outline"
                                nativeButton={false}
                                render={
                                    <a
                                        href="https://github.com/headdeck/headdeck"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                }
                            >
                                <ExternalLink className="size-4"/>
                                GitHub
                            </Button>

                            <Button variant="outline"
                                    nativeButton={false}
                                    render={
                                        <a
                                            href="https://headdeck.org"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    }>
                                Website
                                <ExternalLink className="size-3.5"/>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}