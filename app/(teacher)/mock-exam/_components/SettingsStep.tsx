"use client";

import type { SubjectDraft } from "../../../../types/mock-exam";
import { bn, selectedTopicCount } from "./Selection";

interface Props {
    drafts: SubjectDraft[];
    standards: string[];
    duration: number;
    negativeMarking: boolean;
    onDuration: (n: number) => void;
    onNegativeMarking: (v: boolean) => void;
    onSubmit: () => void;
}

export default function SettingsStep({
    drafts,
    standards,
    duration,
    negativeMarking,
    onDuration,
    onNegativeMarking,
    onSubmit,
}: Props) {
    const totalQuestions = drafts.reduce((s, d) => s + d.questionCount, 0);

    return (
        <div className="pb-24">
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-2 text-sm font-bold text-slate-900">সারসংক্ষেপ</h3>
                <ul className="flex flex-col gap-1.5 text-sm text-slate-700">
                    {drafts.map((d) => (
                        <li key={d.subjectId} className="flex justify-between">
                            <span>{d.name}</span>
                            <span className="text-slate-500">
                                {bn(selectedTopicCount(d))} টপিক · {bn(d.questionCount)} প্রশ্ন
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                    {standards.join(", ")} · মোট {bn(totalQuestions)} প্রশ্ন
                </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <label className="flex items-center justify-between gap-3 text-sm text-slate-800">
                    সময় (মিনিট)
                    <input
                        type="number"
                        min={1}
                        value={duration}
                        onChange={(e) => onDuration(Math.max(1, Number(e.target.value) || 1))}
                        className="h-10 w-24 rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600"
                    />
                </label>

                <label className="flex items-center justify-between gap-3 text-sm text-slate-800">
                    নেগেটিভ মার্কিং
                    <button
                        type="button"
                        role="switch"
                        aria-checked={negativeMarking}
                        onClick={() => onNegativeMarking(!negativeMarking)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${negativeMarking ? "bg-emerald-700" : "bg-slate-300"
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${negativeMarking ? "left-[22px]" : "left-0.5"
                                }`}
                        />
                    </button>
                </label>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 py-3">
                <div className="mx-auto max-w-3xl">
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="h-11 w-full rounded-lg bg-emerald-800 text-sm font-semibold text-white hover:bg-emerald-900"
                    >
                        পরীক্ষা শুরু করো
                    </button>
                </div>
            </div>
        </div>
    );
}