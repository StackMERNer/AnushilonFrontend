
"use client";

import { useState } from "react";
import { useAcademicTree } from "@/hooks/use-academic";
import { getSubjectIconByName } from "@/lib/subjectImageMap";

const MockExamPage = () => {
    const { data: subjects } = useAcademicTree({
        upto: "topic",
        classId: "6a6e31bdd2ea30ebd6a29ded",
    });

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const toggleSubject = (id: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800">
                        Create Mock Exam
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Select the subjects for your exam.
                    </p>
                </div>

                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                        Subjects
                    </span>
                    <span className="text-sm text-slate-500">
                        {selectedSubjects.length} selected
                    </span>
                </div>

                <div className="flex flex-col gap-2.5">
                    {subjects?.map((sub) => {
                        const selected = selectedSubjects.includes(sub._id);

                        return (
                            <button
                                key={sub._id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleSubject(sub._id)}
                                className={`flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all duration-150 active:scale-[0.99] ${selected
                                    ? "border-orange-300 bg-orange-50/60 shadow-sm"
                                    : "border-slate-200 shadow-[0_2px_0_rgba(15,23,42,0.03)] hover:border-slate-300 hover:shadow-sm"
                                    }`}
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                    <img
                                        src={getSubjectIconByName(sub.name)}
                                        alt=""
                                        width={30}
                                        height={30}
                                        className="h-[30px] w-[30px] object-contain"
                                    />
                                </div>

                                <span className="flex-1 text-sm font-semibold text-slate-700 sm:text-base">
                                    {sub.name}
                                </span>

                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : "border-slate-300 bg-white"
                                        }`}
                                >
                                    {selected && (
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="m4 10 4 4 8-8"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {selectedSubjects.length > 0 && (
                    <div className="sticky bottom-4 mt-6">
                        <button
                            type="button"
                            onClick={() =>
                                console.log("Selected subjects:", selectedSubjects)
                            }
                            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 active:bg-orange-700"
                        >
                            Continue ({selectedSubjects.length})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockExamPage;
