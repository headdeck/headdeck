import type {ReactNode} from "react";

import {AppHeader} from "@/components/layout/app-header";
import {AppSidebar} from "@/components/layout/app-sidebar";

import {SidebarInset, SidebarProvider,} from "@/components/ui/sidebar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar/>

            <SidebarInset className="min-w-0">
                <AppHeader/>

                <main className="flex flex-1 flex-col p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}