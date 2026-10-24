// components/PrintQuestionSidebar.tsx
"use client";

import { QUESTION_TYPE_LABEL_MAP } from "@/lib/constants";
import { usePrintSettingsStore } from "@/store/print-settings-store";
import {
    FileFormat,
    FontFamily,
    McqAnswerMarker,
    OptionBulletStyle,
    OptionLabelStyle,
    PaperSize,
} from "@/types/print-settings";
import clsx from "clsx";
import { ChevronDown, Download } from "lucide-react";
import { ReactNode, useState } from "react";
import { PaperSetPicker } from "./PaperSetPicker";
import { PressableButton } from "./ui/pressable-button";
import { Switch } from "./ui/switch";
import { getDefaultSectionOrder } from "@/lib/question-paper";
import { useUserProfile } from "@/hooks/useUserProfile";
import PaperSizePicker from "./PaperSizePicker";
import { ColumnPicker } from "./ColumnPicker";
import PaperSheetToggle from "@/app/(teacher)/my-papers/[paperId]/_components/PaperSheetToggle";
export default function PrintQuestionSidebar() {
    const settings = usePrintSettingsStore((s) => s.settings);
    const update = usePrintSettingsStore((s) => s.update);
    const updateContent = usePrintSettingsStore((s) => s.updateContent);
    const updateQuestionFormat = usePrintSettingsStore((s) => s.updateQuestionFormat);
    const updateFont = usePrintSettingsStore((s) => s.updateFont);
    const updateBranding = usePrintSettingsStore((s) => s.updateBranding);
    // const updateHeaderImage = usePrintSettingsStore((s) => s.updateHeaderImage);
    const fileFormat = usePrintSettingsStore((s) => s.settings.fileFormat);
    const showAnswers = fileFormat === "question-answer";
    const { data: user } = useUserProfile();

    return (
        <div className="space-y-4 print:hidden">
            <PressableButton
                onClick={() => window.print()}
                className="bg-primary mx-auto px-5 py-2 cursor-pointer text-white items-center justify-center w-full hidden md:flex"
                size="default"
            >
                <Download size={18} /> ডাউনলোড
            </PressableButton>


            {/* বেসিক সেটিংস */}
            <SectionCard title="বেসিক সেটিংস" defaultOpen={true}>
                <div>
                    <Label>ফাইল ফরম্যাটিং</Label>
                    <RadioGrid<FileFormat>
                        value={settings.fileFormat}
                        onChange={(v) => update("fileFormat", v)}
                        options={[
                            { value: "question", label: "প্রশ্ন" },
                            { value: "question-answer", label: "প্রশ্ন ও উত্তর" },
                            // { value: "answer-only", label: "উত্তরপত্র" },
                            // { value: "suggestion", label: "সাজেশন" },
                        ]}
                    />
                </div>

                <div>
                    <Label>পেপার সাইজ</Label>

                    <PaperSizePicker
                        value={settings.paperSize}
                        onChange={(v) => update("paperSize", v)}
                    />
                    <div className="mt-5">
                        <SliderRow
                            label="পেজের মার্জিন"
                            value={settings.pageMargin}
                            onChange={(v) => update("pageMargin", v)}
                            unit="mm"
                            max={30}
                        />
                    </div>
                </div>
                <div>
                    <Label>কলাম সংখ্যা</Label>
                    <ColumnPicker
                        value={settings.questionFormat.columnCount}
                        options={[1, 2, 3]}
                        onChange={(v) => updateQuestionFormat("columnCount", v as 1 | 2 | 3)}
                    />
                </div>
                <SliderRow
                    label="কলাম-গ্যাপ"
                    value={settings.questionFormat.columnGap}
                    onChange={(v) => updateQuestionFormat("columnGap", v)}
                />

                {showAnswers && (
                    <div className="mt-2 border border-dashed rounded-lg p-2">
                        <Label>বহুনির্বাচনি উত্তর স্টাইল</Label>
                        <RadioGrid<McqAnswerMarker>
                            value={settings.mcqAnswerMarker}
                            onChange={(v) => update("mcqAnswerMarker", v)}
                            columns={4}
                            options={[
                                { value: "circle", label: "⚫" },
                                { value: "circle-outside", label: "(ক)" },
                                { value: "answer-bn", label: "উঃ" },
                                { value: "answer-en", label: "Ans:" },
                            ]}
                        />

                        <div
                            onClick={() => update("mcqAnswerMarker", "uttor-mala")}
                            className={clsx(
                                "rounded border px-2 py-1.5 text-xs font-medium transition-colors mt-2 flex items-center gap-2 flex-col sm:flex-row",
                                settings.mcqAnswerMarker === "uttor-mala"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-foreground hover:border-primary/50"
                            )}>
                            <button
                                key={"uttor-mala"}
                                type="button"
                            >
                                উত্তরমালা:
                            </button>
                            <div className="inline-block overflow-hidden rounded border border-black/60">
                                <table className="border-collapse text-center text-xs">
                                    <tbody>
                                        {/* Question numbers */}
                                        <tr>
                                            {[1, 2, 3, 4].map((number) => (
                                                <td
                                                    key={number}
                                                    className="h-5 min-w-7 border-b border-r border-black/60 px-1 last:border-r-0"
                                                >
                                                    {number}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Answers */}
                                        <tr>
                                            {["ক", "খ", "গ", "ঘ"].map((answer, index) => (
                                                <td
                                                    key={index}
                                                    className="h-6 border-r border-black/60 last:border-r-0"
                                                >
                                                    <span
                                                        className={clsx(
                                                            "mx-auto flex h-4 w-4 items-center justify-center rounded-full border border-black/60 bg-black text-[9px] text-white",
                                                            settings.mcqAnswerMarker === "uttor-mala" &&
                                                            "border-primary bg-primary"
                                                        )}
                                                    >
                                                        {answer}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {
                            settings.mcqAnswerMarker === "uttor-mala" && <span className="text-xs">*উত্তরপত্র যুক্ত হয়েছে।</span>
                        }
                    </div>)}

                <div>
                    <Label>অপশন স্টাইল</Label>
                    <RadioGrid<OptionBulletStyle>
                        value={settings.questionFormat.optionBulletStyle}
                        onChange={(v) => updateQuestionFormat("optionBulletStyle", v)}
                        columns={4}
                        options={[
                            { value: "paren", label: "()" },
                            { value: "circle", label: "○" },
                            { value: "dot", label: "•" },
                            { value: "none", label: ")" },
                        ]}
                    />
                </div>

                <div>
                    <Label>অপশন লেভেল</Label>
                    <RadioGrid<OptionLabelStyle>
                        value={settings.questionFormat.optionLabelStyle}
                        onChange={(v) => updateQuestionFormat("optionLabelStyle", v)}
                        columns={2}
                        options={[
                            { value: "bn-letter", label: "ক, খ, গ" },
                            { value: "en-letter", label: "a, b, c…" },
                            { value: "bn-number", label: "১, ২, ৩…" },
                            { value: "roman", label: "i, ii, iii…" },
                        ]}
                    />
                </div>

                <div>
                    <Label>অপশন কলাম সংখ্যা</Label>
                    <SegmentedNumber
                        value={settings.questionFormat.optionColumnCount}
                        options={[1, 2, 3, 4]}
                        onChange={(v) => updateQuestionFormat("optionColumnCount", v as 1 | 2 | 3 | 4)}
                    />
                </div>

                <ToggleRow
                    label="প্রশ্ন এডিটিং"
                    checked={settings.editingMode}
                    onChange={(v) => update("editingMode", v)}
                />
                {
                    settings.editingMode && <span className="text-xs text-red-500">* ব্রাউজার রিফ্রেশ করার পূর্বে ডাউনলোড করে নিবেন। </span>
                }
                <PaperSetPicker />
                <PaperSheetToggle />

            </SectionCard>
            <SectionOrderPanel />
            {/* কনটেন্ট ডিসপ্লে */}
            <SectionCard title="কনটেন্ট ডিসপ্লে" defaultOpen={true}>
                <ToggleRow icon="⊞" label="সেট কোড" checked={settings.content.setCode} onChange={(v) => updateContent("setCode", v)} />
                <ToggleRow icon="⊞" label="বিষয় কোড" checked={settings.content.subjectCode} onChange={(v) => updateContent("subjectCode", v)} />
                <ToggleRow icon="H" label="প্রতিষ্ঠানের নাম" checked={settings.content.title} onChange={(v) => updateContent("title", v)} />
                <ToggleRow icon="📍" label="ঠিকানা" checked={settings.content.address} onChange={(v) => updateContent("address", v)} />
                <ToggleRow icon="🏫" label="ক্লাসের নাম" checked={settings.content.className} onChange={(v) => updateContent("className", v)} />
                <ToggleRow icon="📘" label="বিষয়ের নাম" checked={settings.content.subjectName} onChange={(v) => updateContent("subjectName", v)} />
                <ToggleRow icon="📗" label="অধ্যায়ের নাম" checked={settings.content.chapterName} onChange={(v) => updateContent("chapterName", v)} />
                <ToggleRow icon="📍" label="নির্দেশনা" checked={settings.content.instructions} onChange={(v) => updateContent("instructions", v)} />
                <ToggleRow icon="🏷️" label="প্রশ্নের তথ্য" checked={settings.content.questionInfo} onChange={(v) => updateContent("questionInfo", v)} />
                <ToggleRow icon="👤" label="পরীক্ষার্থীর তথ্য" checked={settings.content.examineeInfo} onChange={(v) => updateContent("examineeInfo", v)} />
                <ToggleRow icon="#" label="প্রাপ্ত নাম্বার ঘর" checked={settings.content.marksBox} onChange={(v) => updateContent("marksBox", v)} />
                {/* <ToggleRow icon="⭐" label="বহুনির্বাচনী প্রশ্নের মার্ক" checked={settings.content.mcqMarks} onChange={(v) => updateContent("mcqMarks", v)} /> */}
                <ToggleRow icon="⭐" label="সৃজনশীল প্রশ্নের মার্ক" checked={settings.content.writtenMarks} onChange={(v) => updateContent("writtenMarks", v)} />
                {/* <ToggleRow icon="⊞" label="OMR যুক্ত" checked={settings.content.omrIncluded} onChange={(v) => updateContent("omrIncluded", v)} /> */}
                <ToggleRow icon="⫿⫿" label="কলাম ডিভাইডার" checked={settings.content.columnDivider} onChange={(v) => updateContent("columnDivider", v)} />



                {/* <ToggleRow icon="⊞" label="পৃষ্ঠা নাম্বার" checked={settings.content.pageNumber} onChange={(v) => updateContent("pageNumber", v)} /> */}
            </SectionCard>



            {/* ফন্ট সেটিংস */}
            <SectionCard title="ফন্ট সেটিংস" defaultOpen={true}>
                <div>
                    <Label>ফন্ট</Label>
                    <select
                        value={settings.font.family}
                        onChange={(e) => updateFont("family", e.target.value as FontFamily)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    >
                        <option value="bangla-default">বাংলা (ডিফল্ট)</option>
                        <option value="kalpurush">Kalpurush</option>
                        <option value="arial">Arial (ইংরেজি)</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <Label className="mb-0">সাইজ</Label>
                    <Stepper
                        value={settings.font.size}
                        onChange={(v) => updateFont("size", v)}
                        min={10}
                        max={22}
                    />
                </div>
            </SectionCard>

            {/* ব্র্যান্ডিং */}
            <SectionCard
                title="ব্র্যান্ডিং"
                defaultOpen={true}
            >
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>ব্র্যান্ডিং সেটিংস চালু</Label>
                        <MiniToggle checked={settings.branding.enabled} onChange={(v) => { updateBranding("enabled", v); if (v && !settings.branding.watermarkText) { updateBranding("watermarkText", user?.institute?.name || ""); } }} />
                    </div>
                    <Label>জলছাপ টেক্সট</Label>
                    <input
                        value={settings.branding.watermarkText}
                        onChange={(e) => updateBranding("watermarkText", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                </div>
                {/* <div>
                    <Label>জলছাপ আইকন</Label>
                    <FileDrop
                        hint="(Max size ~5MB, PNG/JPG)"
                        onFile={(url) => updateBranding("watermarkIconUrl", url)}
                    />
                </div> */}
                <SliderRow label="সাইজ" value={settings.branding.size} unit="px" max={200} onChange={(v) => updateBranding("size", v)} />
                <SliderRow label="অপাসিটি" value={settings.branding.opacity} unit="%" onChange={(v) => updateBranding("opacity", v)} />
                {/* <ToggleRow label="জলছাপ রিপিট" checked={settings.branding.repeat} onChange={(v) => updateBranding("repeat", v)} /> */}
            </SectionCard>

            {/* হেডার ইমেজ সেটিংস */}
            {/* <SectionCard
                title="হেডার ইমেজ সেটিংস"
                defaultOpen={false}
            >
                <div className="flex items-center justify-between">
                    <Label>হেডার ইমেজ চালু</Label>
                    <MiniToggle
                        checked={settings.headerImage.enabled}
                        onChange={(v) => updateHeaderImage("enabled", v)}
                    />
                </div>
                <div>
                    <Label>হেডার ইমেজ</Label>
                    <FileDrop hint="Choose File" onFile={(url) => updateHeaderImage("url", url)} />
                </div>
                <div>
                    <Label>ইমেজ ফিট</Label>
                    <select
                        value={settings.headerImage.fit}
                        onChange={(e) => updateHeaderImage("fit", e.target.value as typeof settings.headerImage.fit)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    >
                        <option value="cover">Cover (পুরো জায়গা ভরে)</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                    </select>
                </div>
            </SectionCard> */}

            <style jsx global>{`
                .filter-pill {
                    padding: 0.4rem 1rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    border: 1.5px solid var(--border);
                    background: var(--background);
                    color: var(--ink-soft);
                    transition: all 0.15s ease;
                }
                .filter-pill:hover {
                    border-color: var(--teal);
                    color: var(--ink);
                }
                .filter-pill[data-active="true"] {
                    background: var(--teal);
                    border-color: var(--teal);
                    color: white;
                }
            `}</style>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Building blocks                                                   */
/* ────────────────────────────────────────────────────────────────── */

function SectionCard({
    title,
    hint,
    children,
    defaultOpen = true,
    headerRight,
}: {
    title: string;
    hint?: string;
    children: ReactNode;
    defaultOpen?: boolean;
    headerRight?: ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2 text-left"
            >
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                {hint && <span className="ml-auto text-[11px] text-teal truncate max-w-[45%]">{hint}</span>}
                {headerRight ? (
                    <span className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        {headerRight}
                    </span>
                ) : (
                    <ChevronDown
                        size={16}
                        className={clsx("ml-auto transition-transform text-muted-foreground", open && "rotate-180")}
                    />
                )}
            </button>
            {open && <div className="space-y-3 pt-1">{children}</div>}
        </div>
    );
}

function Label({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={clsx("mb-1.5 text-xs font-medium text-muted-foreground", className)}>{children}</p>;
}

function ToggleRow({
    label,
    checked,
    onChange,
    icon,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    icon?: string;
}) {
    return (
        <div className="flex items-center justify-between py-0.5">
            <span className="flex items-center gap-2 text-sm text-foreground">
                {icon && <span className="text-teal text-xs">{icon}</span>}
                {label}
            </span>
            <MiniToggle checked={checked} onChange={onChange} />
        </div>
    );
}

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <Switch checked={checked} onCheckedChange={onChange} />
    )
}

function RadioGrid<T extends string>({
    value,
    onChange,
    options,
    columns = 2,
}: {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
    columns?: number;
}) {
    return (
        <div className={clsx("grid gap-2")} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={clsx(
                        "rounded-xl border px-2 py-1.5 text-xs font-medium transition-colors",
                        value === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground hover:border-primary/50"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function SegmentedNumber({
    value,
    options,
    onChange,
}: {
    value: number;
    options: number[];
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex gap-2">
            {options.map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={clsx(
                        "flex-1 rounded-xl border py-1.5 text-sm font-semibold transition-colors",
                        value === n
                            ? "border-primary bg-primary text-white"
                            : "border-border text-foreground hover:border-primary/50"
                    )}
                >
                    {n}
                </button>
            ))}
        </div>
    );
}

function SliderRow({
    label,
    value,
    onChange,
    unit = "",
    max = 100,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    unit?: string;
    max?: number;
}) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <Label className="mb-0">{label}</Label>
                <span className="text-xs text-muted-foreground">
                    {value}
                    {unit}
                </span>
            </div>
            <input
                type="range"
                min={0}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-primary"
            />
        </div>
    );
}

function Stepper({
    value,
    onChange,
    min = 0,
    max = 100,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                className="h-7 w-7 rounded-lg border border-border text-sm font-bold"
            >
                −
            </button>
            <span className="w-6 text-center text-sm font-medium">{value}</span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                className="h-7 w-7 rounded-lg border border-border text-sm font-bold"
            >
                +
            </button>
        </div>
    );
}


function SectionOrderPanel() {
    const availableTypes = usePrintSettingsStore((s) => s.availableSectionTypes);
    const customOrder = usePrintSettingsStore((s) => s.sectionOrder);
    const setOrder = usePrintSettingsStore((s) => s.setSectionOrder);

    const order = customOrder ?? getDefaultSectionOrder(availableTypes);

    if (availableTypes.length === 0) return null;

    const move = (index: number, dir: -1 | 1) => {
        const next = [...order];
        const target = index + dir;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setOrder(next);
    };

    if (order.length <= 1) {
        return null;
    }

    return (
        <SectionCard title="প্রশ্নের ক্রম" defaultOpen>
            <ul className="space-y-1">
                {order.map((type, i) => (
                    <li key={type} className="flex items-center justify-between rounded-lg border border-border px-2 py-1.5 text-sm">
                        <span>{QUESTION_TYPE_LABEL_MAP[type] ?? type}</span>
                        <div className="flex gap-1">
                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">↑</button>
                            <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="disabled:opacity-30">↓</button>
                        </div>
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
}
// function FileDrop({ hint, onFile }: { hint: string; onFile: (url: string) => void }) {
//     return (
//         <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background px-3 py-4 text-center text-xs text-muted-foreground hover:border-primary/50">
//             <span>ছবি আপলোড করতে এখানে ক্লিক করুন</span>
//             <span className="text-[10px]">{hint}</span>
//             <input
//                 type="file"
//                 accept="image/png,image/jpeg"
//                 className="hidden"
//                 onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) onFile(URL.createObjectURL(file));
//                 }}
//             />
//         </label>
//     );
// }