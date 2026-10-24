import { PaperSize } from "@/types/print-settings";
import clsx from "clsx";

interface PaperSizeOption {
    value: PaperSize;
    label: string;
    widthRatio: number;  // Width in mm
    heightRatio: number; // Height in mm
}

const PAPER_SIZE_CONFIGS: PaperSizeOption[] = [
    { value: "A4", label: "A4", widthRatio: 210, heightRatio: 297 },
    { value: "A5", label: "A5", widthRatio: 148, heightRatio: 210 },
    { value: "Letter", label: "Letter", widthRatio: 215.9, heightRatio: 279.4 },
    { value: "Legal", label: "Legal", widthRatio: 215.9, heightRatio: 355.6 },
];

function PaperSizePicker({
    value,
    onChange,
}: {
    value: PaperSize;
    onChange: (v: PaperSize) => void;
}) {
    const maxPaperHeight = Math.max(...PAPER_SIZE_CONFIGS.map((p) => p.heightRatio));
    const containerMaxPixelHeight = 40; // Max visual box height in px

    return (
        <div className="grid md:grid-cols-4 grid-cols-2 gap-2">
            {PAPER_SIZE_CONFIGS.map((opt) => {
                const isSelected = value === opt.value;
                const scale = containerMaxPixelHeight / maxPaperHeight;
                const boxHeight = Math.round(opt.heightRatio * scale);
                const boxWidth = Math.round(opt.widthRatio * scale);

                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={clsx(
                            "group flex py-1 items-center justify-between rounded-lg border transition-all flex-col gap-2",
                            isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-xs"
                                : "border-border text-foreground hover:border-primary/50 hover:bg-accent/40"
                        )}
                    >
                        {/* Scaled Visual Paper Box with Size Label inside */}
                        <div
                            style={{
                                width: `${boxWidth}px`,
                                height: `${boxHeight}px`,
                            }}
                            className={clsx(
                                "flex items-center justify-center rounded-xs border transition-all duration-150",
                                isSelected
                                    ? "border-primary bg-primary/20 shadow-2xs"
                                    : "border-muted-foreground/40 bg-background group-hover:border-primary/60"
                            )}
                        >

                        </div>
                        <span className="text-[10px] font-bold tracking-tight">
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default PaperSizePicker;