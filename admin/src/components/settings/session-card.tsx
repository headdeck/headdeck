"use client";

import {useState} from "react";
import {KeyRound, LogOut, ShieldCheck} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

import {signOutAction} from "@/app/(dashboard)/settings/sign-out-action";

export default function SessionCard() {
    const [signingOut, setSigningOut] = useState(false);

    async function handleSignOut() {
        setSigningOut(true);

        try {
            await signOutAction();
        } finally {
            setSigningOut(false);
        }
    }

    return (
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

                    <Badge variant="outline">
                        Authenticated
                    </Badge>
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

                    <span className="text-sm">
                        Hidden
                    </span>
                </div>

                <div className="pt-2">
                    <Button
                        variant="outline"
                        disabled={signingOut}
                        onClick={handleSignOut}
                    >
                        <LogOut className="size-4"/>
                        {signingOut ? "Signing out..." : "Sign Out"}
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                    Signing out ends your HeadDeck session.
                    Your Headscale API key will not be revoked.
                </p>
            </CardContent>
        </Card>
    );
}