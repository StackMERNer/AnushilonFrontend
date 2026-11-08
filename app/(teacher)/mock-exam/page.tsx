"use client";

import { useAcademicTree } from "@/hooks/use-academic";
import SettingsStep from "./_components/SettingsStep";
import StandardStep from "./_components/StandardStep";
import SubjectStep from "./_components/SubjectStep";
import TopicStep from "./_components/TopicStep";
import { buildExamConfig, hasAnySelection } from "./_components/Selection";
import type { SubjectNode } from "../../../types/mock-exam";
import { useMockExamDraft } from "@/hooks/use-mock-exam-draft";


const PROGRESS_STEP = { subject: 0, topics: 1, standard: 2, settings: 3 } as const;

const MockExamPage = () => {
    const { data } = useAcademicTree({
        upto: "topic",
        classId: "6a6e31bdd2ea30ebd6a29ded",
    });
    const subjects = data as SubjectNode[] | undefined;

    const exam = useMockExamDraft();
    const { step, direction, drafts } = exam;

    console.log('drafts', exam);

    const activeSubject = subjects?.find((s) => s._id === exam.activeId);
    const activeDraft = exam.activeId ? drafts[exam.activeId] : undefined;
    const pickedDrafts = Object.values(drafts).filter(hasAnySelection);
    const progress = PROGRESS_STEP[step];

    const handleBack = () => {
        if (step === "topics") exam.backToSubjects();
        else if (step === "standard") exam.goTo("subject", "back");
        else if (step === "settings") exam.goTo("standard", "back");
    };

    const handleSubmit = () => {
        const config = buildExamConfig(drafts, subjects ?? [], exam.standards, {
            duration: exam.duration,
            negativeMarking: exam.negativeMarking,
        });
        // TODO: POST to backend once the model/controller exist
        console.log("Exam config:", JSON.stringify(config, null, 2));
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-4 sm:py-6">
            <style>{`
                @keyframes slide-in-right { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: none; } }
                @keyframes slide-in-left { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: none; } }
            `}</style>

            <div className="mx-auto max-w-3xl overflow-x-hidden">
                {step !== "subject" && (
                    <div className="mb-4">
                        <div className="mb-3 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                            >
                                <span aria-hidden>←</span>
                                {step === "topics"
                                    ? activeSubject?.name
                                    : step === "standard"
                                        ? "প্রশ্নের স্ট্যান্ডার্ড"
                                        : "পরীক্ষার সেটিংস"}
                            </button>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                                {progress.toLocaleString("bn-BD")}/৩ স্টেপস
                            </span>
                        </div>
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-colors ${i <= progress ? "bg-emerald-600" : "bg-slate-200"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* key on step => remounts and replays the slide animation */}
                <div
                    key={step}
                    style={{
                        animation: `${direction === "forward" ? "slide-in-right" : "slide-in-left"
                            } 260ms ease-out`,
                    }}
                >
                    {step === "subject" && (
                        <SubjectStep
                            subjects={subjects}
                            drafts={drafts}
                            onOpen={exam.openSubject}
                            onContinue={() => exam.goTo("standard")}
                        />
                    )}

                    {step === "topics" && activeSubject && activeDraft && (
                        <TopicStep
                            subject={activeSubject}
                            draft={activeDraft}
                            onToggleTopic={exam.toggleTopic}
                            onToggleChapter={exam.toggleChapter}
                            onToggleAll={() => exam.toggleAll(activeSubject)}
                            onQuestionCount={exam.setQuestionCount}
                            onAddAnother={() => exam.goTo("subject", "back")}
                            onContinue={() => exam.goTo("standard")}
                        />
                    )}

                    {step === "standard" && (
                        <StandardStep
                            standards={exam.standards}
                            onToggle={exam.toggleStandard}
                            onContinue={() => exam.goTo("settings")}
                        />
                    )}

                    {step === "settings" && (
                        <SettingsStep
                            drafts={pickedDrafts}
                            standards={exam.standards}
                            duration={exam.duration}
                            negativeMarking={exam.negativeMarking}
                            onDuration={exam.setDuration}
                            onNegativeMarking={exam.setNegativeMarking}
                            onSubmit={handleSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockExamPage;