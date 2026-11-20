
'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { Filter, Settings, X, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { PressableButton } from './ui/pressable-button';

interface FilterContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    collapsed: boolean;
    toggleCollapsed: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useFilterDrawer() {
    const context = useContext(FilterContext);

    if (!context) {
        throw new Error('useFilterDrawer must be used within a FilterDrawerWrapper');
    }

    return context;
}

// Mobile Trigger Button
export function MobileFilterTrigger({
    activeCount,
    filterTitle = "ফিল্টার",
    iconType = 'filter',
}: {
    activeCount?: number;
    filterTitle?: string;
    iconType?: 'filter' | 'settings';
}) {
    const { setIsOpen } = useFilterDrawer();

    const Icon = iconType === 'settings' ? Settings : Filter;

    return (
        <PressableButton
            type="button"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-teal-soft transition-colors cursor-pointer"
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{filterTitle}</span>

            {activeCount !== undefined && activeCount > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {activeCount}
                </span>
            )}
        </PressableButton>
    );
}

// Drawer / Desktop Sidebar
export function FilterDrawerContent({
    children,
    filterTitle = "ফিল্টার",
}: {
    children: React.ReactNode;
    filterTitle: string;
}) {
    const { isOpen, setIsOpen, collapsed, toggleCollapsed } = useFilterDrawer();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed top-0 right-0 dark:bg-black bg-white z-50 h-screen
                    border-l-2 border p-4
                    transform transition-all duration-300 ease-in-out
                    overflow-y-auto lg:overflow-x-hidden
                    lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto
                    lg:h-screen lg:shrink-0
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                    ${collapsed
                        ? "lg:w-14 lg:px-2"
                        : "w-80 sm:w-96 lg:w-80"
                    }
                    print:hidden
                `}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border lg:hidden">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-sm">{filterTitle}</h3>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-teal-tint text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close Filter"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Desktop Collapse Toggle */}
                <div className="hidden lg:flex items-center justify-end mb-4">
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={collapsed ? "Expand filters" : "Collapse filters"}
                        title={collapsed ? "Expand filters" : "Collapse filters"}
                    >
                        {collapsed
                            ? <PanelRightOpen className="w-5 h-5" />
                            : <PanelRightClose className="w-5 h-5" />
                        }
                    </button>
                </div>

                {/* Filter Content */}
                <div className={collapsed ? "lg:hidden" : ""}>
                    {children}
                </div>
            </aside>
        </>
    );
}

export default function FilterDrawerWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setCollapsed(localStorage.getItem('filter-sidebar-collapsed') === 'true');
    }, []);

    const toggleCollapsed = () => {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('filter-sidebar-collapsed', String(next));
            return next;
        });
    };

    return (
        <FilterContext.Provider
            value={{
                isOpen,
                setIsOpen,
                collapsed,
                toggleCollapsed,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}
