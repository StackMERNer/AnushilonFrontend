"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toBnDigits } from "@/lib/helpers";
import { IFilterdPaper } from "@/types/question-paper";
import {
    Eye,
    FileText,
    ListTree,
    Plus,
    Trash2
} from "lucide-react";
import { PressableButton } from "./ui/pressable-button";

interface PaperCardProps {
    paper: IFilterdPaper;
    onDelete: (paperId: string) => void;
    allowDelete: boolean;
}

const PaperCard = ({ paper, onDelete, allowDelete }: PaperCardProps) => {
    const className = paper.class?.name || "N/A";
    const questionCount = paper.sections.reduce(
        (count, section) =>
            count +
            section.items.filter((item) => item.type === "question").length,
        0
    );
    const subjects = paper.subjects || [];

    // If exactly one subject is selected, show it (and its single chapter,
    // if only one) directly in the heading — like a real exam paper does.
    const singleSubject = subjects.length === 1 ? subjects[0] : null;
    const singleSubjectChapters = singleSubject?.chapters || [];
    const singleChapter =
        singleSubjectChapters.length === 1 ? singleSubjectChapters[0] : null;

    const totalChapters = subjects.reduce(
        (sum, s) => sum + (s.chapters?.length || 0),
        0
    );
    const { data: user } = useUserProfile();
    const institute = user?.institute;



    return (
        <div className="group relative flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
            {/* ============ UPPER PORTION — Question Paper Heading (pure white) ============ */}
            {allowDelete && <div className="flex justify-end w-full p-3 ">
                <button onClick={() => onDelete(paper._id)} className="hover:bg-gray-200 bg-gray-100 rounded-lg p-2 cursor-pointer">
                    <Trash2 className="text-gray-600" />
                </button>
            </div>}
            <div className="relative px-5 pt-5 pb-4 bg-white">
                {/* Institution / brand line */}
                <div className="flex items-center justify-center gap-1.5 text-[16px] font-semibold uppercase mb-1">
                    <span>{institute?.name}</span>
                </div>

                {/* Paper Title — acts as the exam name */}
                <h3 className="text-center text-lg font-bold text-slate-800 leading-snug line-clamp-2 px-2">
                    {paper.title}
                </h3>

                {/* Class • Subject • Chapter — centered, exam-heading style */}
                <div className="mt-2 flex flex-col items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-600 font-medium ">
                    <span className="inline-flex items-center gap-1">
                        শ্রেণিঃ {className}
                    </span>

                    {singleSubject?.subject?.name && (
                        <>
                            <span className="inline-flex items-center gap-1">
                                বিষয়ঃ {singleSubject.subject.name}
                            </span>
                        </>
                    )}

                    {singleChapter?.name && (
                        <>
                            <span className="truncate max-w-35">
                                অধ্যায়ঃ {singleChapter.name}
                            </span>
                        </>
                    )}


                </div>
                {/* Marks & Duration */}
                <div className="flex items-center justify-between gap-3 text-xs font-medium ">

                    <div className="flex items-center gap-1">
                        <span>সময়: {toBnDigits(paper.duration)} মিনিট</span>
                    </div>
                    <div>
                        <span>
                            পূর্ণমান: {toBnDigits(paper.totalMarks)}
                        </span>
                    </div>
                </div>

                {/* Decorative double rule — classic paper-heading divider */}
                <div className="mt-3 space-y-0.5 border-b border-neutral-200">
                </div>

                {/* Quick meta row + "view breakdown" trigger — fixed single row, height never grows */}
                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {toBnDigits(questionCount)} টি প্রশ্ন
                    </span>

                    {subjects.length > 0 && (
                        <Dialog>
                            <DialogTrigger>
                                <p
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    <ListTree className="w-3.5 h-3.5" />
                                    বিষয় ও অধ্যায় দেখুন
                                    {totalChapters > 0 && (
                                        <span className="text-[10px] text-slate-400">
                                            ({toBnDigits(totalChapters)})
                                        </span>
                                    )}
                                </p>
                            </DialogTrigger>

                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-base">
                                        বিষয় ও অধ্যায়সমূহ
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
                                    <Accordion className="w-full space-y-1.5">
                                        {subjects.map((item, i) => {
                                            const subject = item.subject;
                                            const chapters = item.chapters || [];

                                            if (!subject) return null;

                                            return (
                                                <AccordionItem
                                                    key={subject._id || i}
                                                    value={subject._id || `subject-${i}`}
                                                    className="border border-slate-100 rounded-lg px-2.5 py-0 bg-slate-50/50"
                                                >
                                                    <AccordionTrigger className="py-2.5 hover:no-underline text-sm text-slate-700 font-medium">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="truncate">
                                                                {subject.name}
                                                            </span>

                                                            {chapters.length > 0 && (
                                                                <span className="shrink-0 text-[10px] text-slate-400">
                                                                    ({toBnDigits(chapters.length)} টি অধ্যায়)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </AccordionTrigger>

                                                    <AccordionContent className="pb-2.5 pt-1 text-xs text-slate-600">
                                                        {chapters.length > 0 ? (
                                                            <div className="pl-2 space-y-1">
                                                                {chapters.map((chapter, idx) => (
                                                                    <p
                                                                        key={chapter._id || idx}
                                                                        className="text-[11px] text-slate-600"
                                                                    >
                                                                        {chapter.name}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[11px] text-slate-400 italic pl-1">
                                                                কোনো নির্দিষ্ট অধ্যায় নির্বাচন করা হয়নি
                                                            </p>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* ============ LOWER PORTION — white → primary gradient, from the seam ============ */}
            <div className="px-5 py-4  flex flex-col gap-3">
                {/* Actions */}
                <div className="flex items-center gap-2 justify-between flex-wrap">
                    <PressableButton
                        href={`/my-papers/${paper._id}/add-questions?class=${paper.class._id}&subject=${subjects[0]?.subject?._id || ""}&chapter=${subjects[0]?.chapters?.[0]?._id || ""}`}
                        className="flex-1 gap-1.5 w-full bg-primary"
                    >
                        <span>প্রশ্ন যুক্ত করুন</span>
                        <Plus className="w-3.5 h-3.5" />
                    </PressableButton>

                    <PressableButton
                        href={`/my-papers/${paper._id}`}
                        className="flex-1 gap-1.5 w-full "
                        variant="secondary"
                    >
                        <span>প্রশ্নপত্র দেখুন</span>
                        <Eye className="w-3.5 h-3.5" />
                    </PressableButton>
                </div>
            </div>
        </div>
    );
};

export default PaperCard;