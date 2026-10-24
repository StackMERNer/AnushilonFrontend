// components/dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    subtitle: string;
    isFilled?: boolean;
}

export function StatCard({ label, value, subtitle, isFilled = false }: StatCardProps) {
    if (isFilled) {
        return (
            <div className="bg-primary text-white rounded-2xl p-4.5 relative border-none shadow-sm">
                <div className="text-[13px] font-semibold mb-2.5 flex justify-between items-center">
                    {label}
                    <span className="w-6 h-6 rounded-full border border-white/35 flex items-center justify-center text-xs">
                        ↗
                    </span>
                </div>
                <div className="font-tiro text-3xl sm:text-[32px] mb-1.5">{value}</div>
                <div className="text-[11.5px] opacity-70">{subtitle}</div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-4.5 relative shadow-sm">
            <div className="text-[13px] font-semibold mb-2.5 flex justify-between items-center">
                {label}
                <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs">
                    ↗
                </span>
            </div>
            <div className="font-tiro text-3xl sm:text-[32px] mb-1.5">{value}</div>
            <div className="text-[11.5px] opacity-70">{subtitle}</div>
        </div>
    );
}