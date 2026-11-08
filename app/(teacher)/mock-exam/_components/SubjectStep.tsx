"use client";

import { getSubjectIconByName } from "@/lib/subjectImageMap";
import type { SubjectDraft, SubjectNode } from "../../../../types/mock-exam";
import { bn, hasAnySelection, selectedTopicCount } from "./Selection";

interface Props {
    subjects?: SubjectNode[];
    drafts: Record<string, SubjectDraft>;
    onOpen: (subject: SubjectNode) => void;
    onContinue: () => void;
}

export default function SubjectStep({ subjects, drafts, onOpen, onContinue }: Props) {
    const addedCount = Object.values(drafts).filter(hasAnySelection).length;

    return (
        <div>
            <h2 className="mb-4 text-base font-bold text-slate-900">বিষয় সিলেক্ট করো</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {subjects?.map((sub) => {
                    const draft = drafts[sub._id];
                    const added = hasAnySelection(draft);

                    return (
                        <button
                            key={sub._id}
                            type="button"
                            onClick={() => onOpen(sub)}
                            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 active:scale-[0.99] ${added
                                ? "border-emerald-600 bg-emerald-50"
                                : "border-slate-200 bg-white shadow-[0_3px_0_rgba(15,23,42,0.06)] hover:border-slate-300"
                                }`}
                        >
                            <img
                                src={getSubjectIconByName(sub.name)}
                                alt=""
                                width={26}
                                height={26}
                                className="h-[26px] w-[26px] shrink-0 object-contain"
                            />
                            <span className="flex-1 text-sm font-semibold text-slate-800">
                                {sub.name}
                            </span>
                            {added && (
                                <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">
                                    {bn(selectedTopicCount(draft))} টপিক
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {addedCount > 0 && (
                <div className="sticky bottom-0 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
                    <button
                        type="button"
                        onClick={onContinue}
                        className="w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900"
                    >
                        এগিয়ে যাও ({bn(addedCount)}টি বিষয়)
                    </button>
                </div>
            )}
        </div>
    );
}