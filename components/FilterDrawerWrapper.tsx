'use client';

import React, { useState, createContext, useContext } from 'react';
import { Filter, Settings, X } from 'lucide-react';
import { PressableButton } from './ui/pressable-button';

interface FilterContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useFilterDrawer() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilterDrawer must be used within a FilterDrawerWrapper');
    }
    return context;
}

// Mobile Trigger Button (used inside QuestionList)
export function MobileFilterTrigger({ activeCount, filterTitle = "ফিল্টার", iconType = 'filter', }: { activeCount?: number, filterTitle?: string, iconType?: 'filter' | 'settings', }) {
    const { setIsOpen } = useFilterDrawer();

    const getIcon = () => {
        switch (iconType) {
            case 'filter':
                return <Filter className="w-3.5 h-3.5" />
            case 'settings':
                return <Settings className="w-3.5 h-3.5" />
            default:
                return <Filter className="w-3.5 h-3.5" />
        }
    }

    return (
        <PressableButton
            type="button"
            size={'sm'}
            onClick={() => setIsOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-teal-soft transition-colors cursor-pointer"
        >
            {getIcon()}

            <span>{filterTitle}</span>
            {activeCount !== undefined && activeCount > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {activeCount}
                </span>
            )}
        </PressableButton>
    );
}

// Drawer / Sidebar Container (Named Export)
export function FilterDrawerContent({ children, filterTitle = "ফিল্টার" }: { children: React.ReactNode, filterTitle: string }) {
    const { isOpen, setIsOpen } = useFilterDrawer();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Drawer / Desktop Sticky Sidebar */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-80 sm:w-96 bg-card border-l-2 border-dashed border-border p-4 transform transition-transform duration-300 ease-in-out overflow-y-auto lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-80 shrink-0 print:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Mobile Drawer Header */}
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

                <div>{children}</div>
            </aside>
        </>
    );
}

export default function FilterDrawerWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <FilterContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </FilterContext.Provider>
    );
}