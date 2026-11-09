"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Activity, KeyRound, LayoutDashboard, type LucideIcon, Network, Settings, Shield, Users,} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

type NavigationItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

const navigation: NavigationItem[] = [
    {title: "Overview", href: "/", icon: LayoutDashboard},
    {title: "Nodes", href: "/nodes", icon: Network},
    {title: "Users", href: "/users", icon: Users},
    {title: "Pre-auth Keys", href: "/preauth-keys", icon: KeyRound},
    {title: "Access Policies", href: "/access-policies", icon: Shield},
    {title: "API Keys", href: "/api-keys", icon: KeyRound},
];

export function AppSidebar({basePath}: {basePath: string}) {
    const pathname = usePathname();
    const withBasePath = (path: string) => `${basePath}${path === "/" ? "/" : path}`;

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Link
                    href={withBasePath("/")}
                    className="flex h-12 items-center gap-3 px-2"
                >
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Network className="size-5"/>
                    </div>

                    <div className="grid min-w-0 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">
              HeadDeck
            </span>
                        <span className="truncate text-xs text-muted-foreground">
              Headscale Management
            </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => {
                                const href = withBasePath(item.href);
                                const active = pathname === href;
                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <Link
                                            href={href}
                                            aria-current={active ? "page" : undefined}
                                            title={item.title}
                                            className={[
                                                "flex h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors",
                                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                "group-data-[collapsible=icon]:justify-center",
                                                active
                                                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                                    : "text-sidebar-foreground",
                                            ].join(" ")}
                                        >
                                            <Icon className="size-4 shrink-0"/>
                                            <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                                        </Link>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            href={withBasePath("/settings")}
                            title="Settings"
                            className={[
                                "flex h-9 items-center gap-3 rounded-md px-2 text-sm",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                "group-data-[collapsible=icon]:justify-center",
                                pathname === withBasePath("/settings")
                                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground",
                            ].join(" ")}
                        >
                            <Settings className="size-4 shrink-0"/>
                            <span className="group-data-[collapsible=icon]:hidden">
                Settings
              </span>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div
                    className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    <Activity className="size-3.5"/>
                    <span>HeadDeck</span>
                </div>
            </SidebarFooter>

            <SidebarRail/>
        </Sidebar>
    );
}