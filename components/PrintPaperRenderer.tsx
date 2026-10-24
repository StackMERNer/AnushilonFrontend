"use client";
import { useSidebar } from "@/context/SidebarContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getFontFamilyValue } from "@/lib/fonts";
import { getFormattedTime, toBnDigits } from "@/lib/helpers";
import { setLabels } from "@/lib/paper-set";
import { getDefaultSectionOrder } from "@/lib/question-paper";
import { usePaperSetStore } from "@/store/paper-set-store";
import { usePrintSettingsStore } from "@/store/print-settings-store";
import { PAPER_DIMENSIONS, getSheetTheme } from "@/types/print-settings";
import {
    IPopulatedQuestionPaper,
} from "@/types/question-paper";
import clsx from "clsx";
import { Download, Menu } from "lucide-react";
import { useEffect, useRef } from "react";
import { MobileFilterTrigger } from "./FilterDrawerWrapper";
import PaperSection from "./PaperSection";
import PaperWatermark from "./PaperWatermark";
import { PressableButton } from "./ui/pressable-button";

export default function PrintPaperRenderer({
    paper,
}: {
    paper: IPopulatedQuestionPaper;
}) {
    const font = usePrintSettingsStore((s) => s.settings.font);
    const fontFamilyValue = getFontFamilyValue(font.family);
    const content = usePrintSettingsStore((s) => s.settings.content);
    const questionFormat = usePrintSettingsStore((s) => s.settings.questionFormat);
    const fileFormat = usePrintSettingsStore((s) => s.settings.fileFormat);
    const showAnswers = fileFormat === "question-answer";
    const showUttorMala = usePrintSettingsStore((s) => s.settings.mcqAnswerMarker === "uttor-mala");
    const branding = usePrintSettingsStore((s) => s.settings.branding);
    const paperSize = usePrintSettingsStore((s) => s.settings.paperSize);
    const pageMargin = usePrintSettingsStore((s) => s.settings.pageMargin);

    // লেকচার শীট
    const sheet = usePrintSettingsStore((s) => s.settings.sheet);
    const sheetEnabled = sheet.enabled;
    const sheetTheme = getSheetTheme(sheet.themeId);
    const colored = sheetEnabled && sheet.coloredBackground;
    const todayBn = toBnDigits(new Date().toLocaleDateString("en-GB") as any); // ১৮/১০/২০২৬

    const paperRef = useRef<HTMLDivElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const activeSetIndex = usePaperSetStore((s) => s.activeSetIndex);
    const activeSetLabel = activeSetIndex !== null ? setLabels[activeSetIndex] : "ক";

    const { data: user } = useUserProfile();

    const { toggleMobileMenu } = useSidebar();

    const setAvailableSectionTypes = usePrintSettingsStore((s) => s.setAvailableSectionTypes);
    const customSectionOrder = usePrintSettingsStore((s) => s.sectionOrder);

    const resetStore = usePrintSettingsStore((s) => s.resetStore);

    const paperDimensions = PAPER_DIMENSIONS[paperSize];

    useEffect(() => {
        setAvailableSectionTypes(paper.sections.map((s) => s.type));
    }, [paper.sections, setAvailableSectionTypes]);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, [resetStore]);

    useEffect(() => {
        const container = listContainerRef.current;
        const mathJax = (window as any).MathJax;

        if (!container || !mathJax?.Hub) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            mathJax.Hub.Queue([
                "Typeset",
                mathJax.Hub,
                container,
            ]);
        });

        return () => cancelAnimationFrame(frame);
    }, [paper, showAnswers]);

    const isMcqOnly = paper.sections.length === 1 && paper.sections[0].type === "mcq";
    // const isEditingMode = usePrintSettingsStore((s) => s.settings.editingMode);
    const editableProps = true ? {
        contentEditable: true,
        suppressContentEditableWarning: true,
    } : undefined;

    const subjectCount = paper.subjects.length;
    const chapters = paper.subjects.flatMap((subject) => subject.chapters);

    const desiredOrder = customSectionOrder ?? getDefaultSectionOrder(paper.sections.map(s => s.type));
    const sectionOrderMap = new Map(desiredOrder.map((type, index) => [type, index]));

    const sortedSections = [...(paper?.sections || [])].sort((a, b) => {
        const indexA = sectionOrderMap.has(a.type) ? sectionOrderMap.get(a.type)! : Infinity;
        const indexB = sectionOrderMap.has(b.type) ? sectionOrderMap.get(b.type)! : Infinity;
        return indexA - indexB;
    });

    const institute = user?.institute;
    // Assumption: the profile has a `name` field. Change if yours differs.
    const instructorName = (user as any)?.name || "ইন্সট্রাক্টরের নাম";

    useEffect(() => {
        const originalTitle = document.title;
        document.title = `${paper.title || 'untitled'} - অনুশীলন.কম`;

        return () => {
            document.title = originalTitle;
        };
    }, [paper]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            className="min-h-screen bg-neutral-100 py-4 sm:py-8 print:bg-white print:py-0 px-4 print:px-[1mm]"
            ref={listContainerRef}
        >

            {/* Mobile toolbar */}
            <div className="flex justify-between items-center border-b sticky top-0 z-10 mb-3 py-3 px-2 bg-white lg:hidden print:hidden">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-xl bg-card border border-border lg:hidden text-foreground"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <PressableButton
                    size="sm"
                    onClick={handlePrint}
                    className="bg-primary mx-auto px-3 py-1 cursor-pointer text-white flex items-center justify-center"
                >
                    <Download size={14} /> ডাউনলোড
                </PressableButton>

                <div className="flex items-center gap-2">
                    <MobileFilterTrigger
                        filterTitle="সেটিংস"
                        iconType="settings"
                    />
                </div>
            </div>

            <div className="flex items-center justify-center w-full print:hidden pb-2">
                <PressableButton variant={'outline'} href={`/my-papers/${paper._id}/add-questions?class=${paper.class._id}&subject=${paper.subjects[0].subject._id}&chapter=${paper.subjects[0].chapters[0]._id}`} size={'sm'} >
                    + আরও প্রশ্ন যুক্ত করুন
                </PressableButton>
            </div>

            {/* Paper */}
            <div
                ref={paperRef}
                style={{ fontSize: `${font.size}px`, fontFamily: fontFamilyValue, }}
                className="print-paper relative z-10 mx-auto w-full max-w-[210mm]
                bg-white
                px-4 sm:px-6 md:px-8
                py-5 sm:py-6 md:py-8
                leading-relaxed
                text-black
                min-h-0
                shadow-lg
                print:max-w-none
                print:px-0
                print:py-0
                print:leading-[1.35]
                print:shadow-none
                print:bg-white
                print:text-black
    "
            >
                <style>{`
                    @media print {
                        @page {
                            size: ${paperDimensions.cssSize};
                            margin: ${pageMargin}mm;
                        }

                        html,
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-paper {
                            width: ${paperDimensions.width} !important;
                            max-width: none !important;
                        }
                    }
                `}</style>
                {branding.enabled && <PaperWatermark branding={branding} />}
                <div
                    className={clsx(
                        "mb-3 text-black",
                        colored && "px-3 py-2 print:[print-color-adjust:exact]"
                    )}
                    style={colored ? { background: sheetTheme.bg, color: sheetTheme.fg } : undefined}
                >
                    <div className="relative flex flex-col items-center justify-center w-full">
                        <div className="text-center flex-1 w-full">
                            {content.title && <h1 {...editableProps} spellCheck="false" className="editable text-2xl font-bold tracking-tight">{institute?.name || "প্রতিষ্ঠানের নাম"}</h1>}
                            {content.address && (
                                <p {...editableProps} spellCheck="false" className="editable text-[12x] mt-0.5">
                                    {institute?.address || "প্রতিষ্ঠানের ঠিকানা"}
                                </p>
                            )}

                            <div className="editable relative flex w-full items-center justify-center">
                                {content.className && <h2 {...editableProps} spellCheck="false" className="editable text-base font-bold">শ্রেণি: {" "}
                                    {paper.class.name}
                                </h2>
                                }
                                {content.setCode && (
                                    <table {...editableProps} spellCheck="false" className="editable absolute right-0 border-collapse border border-current text-center text-xs">
                                        <tbody>
                                            <tr>
                                                <td className="border border-current px-2 py-0.5 font-medium">
                                                    সেট
                                                </td>
                                                <td className="border border-current px-2.5 py-0.5 font-bold">{activeSetLabel}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="relative w-full min-h-6 flex items-center justify-center mt-0.5">
                                {/* Left: lecture number (sheet) / marks box (paper) */}
                                {sheetEnabled ? (
                                    sheet.showLectureNumber && (
                                        <div {...editableProps} spellCheck="false" className="editable absolute left-0 top-0 whitespace-nowrap text-[11px] sm:text-xs">
                                            লেকচার নং: ০১
                                        </div>
                                    )
                                ) : (
                                    content.marksBox && (
                                        <div className="absolute left-0 top-0 flex items-center text-[10px] sm:text-xs">
                                            <div {...editableProps} spellCheck="false" className="editable flex border border-black whitespace-nowrap">
                                                <span className="bg-slate-900 px-1.5 sm:px-2 py-0.5 text-white font-medium print:[print-color-adjust:exact]">
                                                    প্রাপ্ত নম্বর
                                                </span>
                                                <span className="w-10 sm:w-12 bg-white" />
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Subject name — center */}
                                {content.subjectName && (
                                    <p {...editableProps} spellCheck="false" className="editable mx-16 sm:mx-36 mt-0.5 text-center font-semibold whitespace-nowrap text-base">
                                        {subjectCount === 1 ? "বিষয়: " : "বিষয় সমূহ: "}
                                        {paper.subjects.map((subject) => subject.subject.name).join(", ")}
                                    </p>
                                )}

                                {/* Right: date (sheet) / subject code (paper) */}
                                {sheetEnabled ? (
                                    sheet.showDate && (
                                        <div {...editableProps} spellCheck="false" className="editable absolute right-0 top-0 whitespace-nowrap text-[11px] sm:text-xs">
                                            তারিখ: {todayBn}
                                        </div>
                                    )
                                ) : (
                                    content.subjectCode && subjectCount === 1 && (
                                        <div {...editableProps} spellCheck="false" className="editable absolute right-0 top-0 flex items-center gap-1 text-[10px] sm:text-[11px]">
                                            <span className="font-medium whitespace-nowrap">
                                                বিষয় কোড :
                                            </span>

                                            <div className="flex border-t border-l border-b border-black">
                                                {[0, 1, 2].map((i) => (
                                                    <span
                                                        key={i}
                                                        className="flex h-5 w-4 sm:w-5 items-center justify-center border-r border-black font-semibold"
                                                    >
                                                        {paper.subjects[0].subject.subjectCode[i]}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            {/* chaper name, if only one */}
                            {content.chapterName && (
                                chapters.length === 1 && (
                                    <p {...editableProps} spellCheck="false" className="editable text-center  font-semibold whitespace-nowrap">
                                        অধ্যায়: {chapters[0].name}
                                    </p>
                                )
                            )}

                            {/* Sheet: instructor + lecture topic */}
                            {sheetEnabled && sheet.showInstructor && (
                                <p {...editableProps} spellCheck="false" className="editable text-center">
                                    <b>ইন্সট্রাক্টর:</b> {instructorName}
                                </p>
                            )}
                            {sheetEnabled && sheet.showLectureTopic && (
                                <p {...editableProps} spellCheck="false" className="editable text-center text-sm">
                                    লেকচার টপিক: {paper.title || "টপিকের নাম"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Exam-only parts are hidden in sheet mode */}
                    {!sheetEnabled && (
                        <div {...editableProps} spellCheck="false" className="editable mt-2 flex flex-wrap justify-between gap-2 pb-1 font-semibold">
                            <span>সময়: {getFormattedTime(paper.duration, 'bn')}</span>
                            <span>পূর্ণমান: {toBnDigits(paper.totalMarks)}</span>
                        </div>
                    )}

                    {
                        !sheetEnabled && content.examineeInfo && (
                            <div className="text-[8px] sm:text-[8.5pt] leading-tight text-neutral-800 py-2 flex gap-2">
                                <div className="flex items-center gap-1  mb-2 flex-2">
                                    <span className="font-semibold whitespace-nowrap mb-2">পরীক্ষার্থীর নাম:</span>
                                    <p className="w-full border-b border-dashed border-black"></p>
                                </div>
                                <div className="flex items-center gap-1 mb-2 flex-1">
                                    <span className="font-semibold mb-2">রোল:</span>
                                    <p className="w-full border-b border-dashed border-black"></p>
                                </div>
                            </div>
                        )
                    }

                    {!sheetEnabled && content.instructions && (
                        <div {...editableProps} spellCheck="false" className="editable pt-1 text-center text-[14px] leading-tight text-neutral-800 border-t ">
                            {isMcqOnly && <p className="italic">
                                [দ্রষ্টব্য: সরবরাহকৃত নৈর্ব্যক্তিক অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসংবলিত বৃত্ত সমূহ হতে সঠিক উত্তরের বৃত্তটি{" "}
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-black align-middle mx-0.5 print:[print-color-adjust:exact]"></span>{" "}
                                বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো। প্রতিটি প্রশ্নের মান ১।]
                            </p>}
                            <p className="font-bold text-black">
                                প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবে না।
                            </p>
                        </div>
                    )}
                </div>

                <div
                    className={clsx('paper-sections',
                        "columns-1",
                        questionFormat.columnCount === 2 &&
                        "sm:columns-2 print:columns-2",
                        questionFormat.columnCount === 3 &&
                        "sm:columns-3 print:columns-3",
                        content.columnDivider &&
                        "[column-rule:1px_solid_#D3D0D0]",
                    )}
                    style={{
                        columnGap: `${(questionFormat.columnGap / 100) * 3}rem`,
                        rowGap: `${(questionFormat.rowGap / 100) * 1.5}rem`,
                    }}
                >
                    {sortedSections.map((section) => (
                        <PaperSection
                            key={section._id}
                            section={section as any}
                            paperId={paper._id}
                            showUttorMcqMala={showUttorMala && showAnswers && section.type === "mcq"}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}