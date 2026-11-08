"use client";

import Checkbox from "./Checkbox";
import { QUESTION_STANDARDS } from "../../../../types/mock-exam";

interface Props {
    standards: string[];
    onToggle: (s: string) => void;
    onContinue: () => void;
}

export default function StandardStep({ standards, onToggle, onContinue }: Props) {
    return (
        <div className="pb-24">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {QUESTION_STANDARDS.map((s) => {
                    const checked = standards.includes(s);
                    return (
                        <button
                            key={s}
                            type="button"
                            aria-pressed={checked}
                            onClick={() => onToggle(s)}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm ${checked
                                ? "border-emerald-700 bg-emerald-50 font-medium"
                                : "border-slate-200 bg-white"
                                }`}
                        >
                            <Checkbox checked={checked} />
                            {s}
                        </button>
                    );
                })}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 py-3">
                <div className="mx-auto max-w-3xl">
                    <button
                        type="button"
                        disabled={standards.length === 0}
                        onClick={onContinue}
                        className="h-11 w-full rounded-lg bg-emerald-800 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        এগিয়ে যাও
                    </button>
                </div>
            </div>
        </div>
    );
}