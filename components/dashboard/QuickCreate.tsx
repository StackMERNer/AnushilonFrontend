// components/dashboard/QuickCreate.tsx
import React from 'react';

const SUBJECTS = [
    { name: 'বাংলা', count: '৪২০ প্রশ্ন' },
    { name: 'ইংরেজি', count: '৩৮৫ প্রশ্ন' },
    { name: 'গণিত', count: '৫১০ প্রশ্ন' },
    { name: 'বিজ্ঞান', count: '৩৬০ প্রশ্ন' },
];

export function QuickCreate() {
    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-tiro text-lg font-normal">দ্রুত তৈরি করুন</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                {SUBJECTS.map((sub) => (
                    <div
                        key={sub.name}
                        className="border border-dashed border-border rounded-xl p-3.5 text-center cursor-pointer hover:border-[#2F6E54] hover:bg-green-tint transition-all"
                    >
                        <div className="font-tiro text-[15px]">{sub.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{sub.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}