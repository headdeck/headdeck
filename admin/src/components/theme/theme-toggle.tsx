"use client";

import {useEffect, useState} from "react";
import {Monitor, Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";

const themes = ["system", "light", "dark"] as const;

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = themes.includes(
        theme as (typeof themes)[number]
    )
        ? theme
        : "system";

    const nextTheme = () => {
        const index = themes.indexOf(
            currentTheme as (typeof themes)[number]
        );

        setTheme(themes[(index + 1) % themes.length]);
    };

    const Icon =
        !mounted || currentTheme === "system"
            ? Monitor
            : currentTheme === "light"
                ? Sun
                : Moon;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={nextTheme}
            disabled={!mounted}
            aria-label={`Appearance: ${mounted ? currentTheme : "system"}. Change theme`}
            title={`Theme: ${mounted ? currentTheme : "system"}`}
        >
            <Icon className="size-4"/>
        </Button>
    );
}