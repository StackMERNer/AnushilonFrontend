'use client';

import { usePrintSettingsStore } from '@/store/print-settings-store';
import clsx from 'clsx';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import SheetSettingsModal from './SheetSettingsModal';

const PaperSheetToggle = () => {
    const enabled = usePrintSettingsStore((s) => s.settings.sheet.enabled);
    const updateSheet = usePrintSettingsStore((s) => s.updateSheet);
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2.5">
                <span className="text-sm font-medium">শীট</span>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label="শীট মোড"
                        onClick={() => updateSheet('enabled', !enabled)}
                        className={clsx(
                            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                            enabled ? 'bg-primary' : 'bg-gray-300'
                        )}
                    >
                        <span
                            className={clsx(
                                'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                                enabled && 'translate-x-5'
                            )}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-label="শীট সেটিংস"
                        title="শীট সেটিংস"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <SheetSettingsModal open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default PaperSheetToggle;