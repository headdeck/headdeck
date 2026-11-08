"use client";

import {usePathname} from "next/navigation";

import {Separator} from "@/components/ui/separator";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {ThemeToggle} from "@/components/theme/theme-toggle";

const pageTitles: Record<string, string> = {
    "/": "Overview",
    "/nodes": "Nodes",
    "/users": "Users",
    "/pre-auth-keys": "Pre-auth Keys",
    "/policies": "Access Policies",
    "/api-keys": "API Keys",
    "/settings": "Settings",
};

export function AppHeader() {
    const pathname = usePathname();
    const title = pageTitles[pathname] ?? "HeadDeck";

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger/>

                <Separator orientation="vertical" className="h-5"/>

                <h1 className="truncate text-sm font-semibold">
                    {title}
                </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle/>
            </div>
        </header>
    );
}