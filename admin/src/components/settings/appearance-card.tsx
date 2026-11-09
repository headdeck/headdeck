"use client";

import {useEffect, useState} from "react";
import {useTheme} from "next-themes";
import {Monitor, Moon, Palette, Sun} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

const themes = [
    {value: "light", label: "Light", icon: Sun},
    {value: "dark", label: "Dark", icon: Moon},
    {value: "system", label: "System", icon: Monitor},
] as const;

export default function AppearanceCard() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
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
    );
}