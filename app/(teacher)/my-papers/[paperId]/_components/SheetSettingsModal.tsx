'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePrintSettingsStore } from '@/store/print-settings-store';
import { PrintSettings, SHEET_THEMES } from '@/types/print-settings';

type ToggleKey = Exclude<keyof PrintSettings['sheet'], 'enabled' | 'themeId'>;

const TOGGLES: { key: ToggleKey; label: string }[] = [
    { key: 'showInstructor', label: 'ইন্সট্রাক্টরের নাম' },
    { key: 'showLectureNumber', label: 'লেকচার নম্বর' },
    { key: 'showLectureTopic', label: 'লেকচার টপিক' },
    { key: 'showDate', label: 'তারিখ' },
    { key: 'coloredBackground', label: 'ব্যাকগ্রাউন্ড কালার' },
];

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={clsx(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                checked ? 'bg-primary' : 'bg-gray-300'
            )}
        >
            <span
                className={clsx(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    checked && 'translate-x-5'
                )}
            />
        </button>
    );
}

export default function SheetSettingsModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const sheet = usePrintSettingsStore((s) => s.settings.sheet);
    const updateSheet = usePrintSettingsStore((s) => s.updateSheet);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="print:hidden fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="শীট সেটিংস"
                className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 text-foreground shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">শীট সেটিংস</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
                    শীটের সেটিংস সংরক্ষিত থাকবে না। পেজ ছাড়ার আগে শীটটি ডাউনলোড করে নিন।
                </p>

                <div className="space-y-2">
                    {TOGGLES.map(({ key, label }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-3"
                        >
                            <span className="text-sm font-medium">{label}</span>
                            <Switch
                                checked={sheet[key]}
                                onChange={(v) => updateSheet(key, v)}
                            />
                        </div>
                    ))}
                </div>

                <div className={clsx('mt-4', !sheet.coloredBackground && 'opacity-50')}>
                    <div className="mb-2 text-xs text-gray-600">রঙের থিম</div>
                    <div className="grid grid-cols-6 gap-2">
                        {SHEET_THEMES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                    updateSheet('themeId', t.id);
                                    if (!sheet.coloredBackground) {
                                        updateSheet('coloredBackground', true);
                                    }
                                }}
                                aria-label={t.id}
                                aria-pressed={sheet.themeId === t.id}
                                className={clsx(
                                    'flex h-12 flex-col overflow-hidden rounded-md border',
                                    sheet.themeId === t.id
                                        ? 'ring-2 ring-primary ring-offset-1'
                                        : 'border-gray-200'
                                )}
                            >
                                <span className="flex-1" style={{ background: t.bg }} />
                                <span className="flex-1" style={{ background: t.fg }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}