"use client";

import {useState} from "react";
import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Network} from "lucide-react";

import {AuthSchema} from "@headdeck/shared";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export default function LoginForm({basePath}: {basePath: string}) {
    const router = useRouter();

    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();

        if (loading) {
            return;
        }

        const parsed = AuthSchema.LoginSchema.safeParse({apiKey});

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid API key");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                apiKey: parsed.data.apiKey,
                redirect: false,
            });

            if (result?.error) {
                setError("Unable to authenticate. Check your Headscale API key.");
                return;
            }

            router.replace(`${basePath}/`);
            router.refresh();
        } catch {
            setError("Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-svh flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Network className="size-6"/>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        HeadDeck
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Headscale Management
                    </p>
                </div>
            </div>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Connect to Headscale
                    </CardTitle>
                    <CardDescription>
                        Enter your Headscale API key to access the management dashboard.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">
                                API Key
                            </Label>

                            <div className="relative">
                                <KeyRound
                                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />

                                <Input
                                    id="api-key"
                                    type={showApiKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(event) => {
                                        setApiKey(event.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Enter your API key"
                                    autoComplete="off"
                                    spellCheck={false}
                                    disabled={loading}
                                    className="pr-11 pl-10"
                                />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                                    disabled={loading}
                                >
                                    {showApiKey ? (
                                        <EyeOff className="size-4"/>
                                    ) : (
                                        <Eye className="size-4"/>
                                    )}
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Use an API key generated by your Headscale server.
                            </p>
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !apiKey.trim()}
                        >
                            {loading ? (
                                <LoaderCircle className="size-4 animate-spin"/>
                            ) : (
                                <LockKeyhole className="size-4"/>
                            )}
                            {loading ? "Connecting..." : "Connect"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
                Open-source Headscale management
            </p>
        </main>
    );
}