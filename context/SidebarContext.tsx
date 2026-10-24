'use client';

import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    openMobileMenu: () => void;
    collapsed: boolean;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
    const closeMobileMenu = () => setMobileMenuOpen(false);
    const openMobileMenu = () => setMobileMenuOpen(true);
    const toggleCollapsed = () => setCollapsed((prev) => !prev);

    return (
        <SidebarContext.Provider
            value={{
                mobileMenuOpen,
                setMobileMenuOpen,
                toggleMobileMenu,
                closeMobileMenu,
                openMobileMenu,
                collapsed,
                toggleCollapsed,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}