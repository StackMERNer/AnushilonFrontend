'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

function ShellLayout({ children, layout }: { children: React.ReactNode, layout: "admin" | "teacher" }) {
    const { collapsed } = useSidebar();

    return (
        <div
            className="min-h-screen grid grid-cols-1 lg:grid-cols-[var(--sidebar-w)_1fr] transition-[grid-template-columns] duration-300 ease-in-out"
            style={{ ['--sidebar-w' as string]: collapsed ? '80px' : '264px' }}
        >
            <Sidebar layout={layout} />
            <div className="flex flex-col min-w-0">
                <header>
                    <Topbar />
                </header>
                <main>{children}</main>
            </div>
        </div>
    );
}

export default function AppShell({ children, layout = "teacher" }: { children: React.ReactNode, layout: "admin" | "teacher" }) {
    return (
        <SidebarProvider>
            <ShellLayout layout={layout}>{children}</ShellLayout>
        </SidebarProvider>
    );
}