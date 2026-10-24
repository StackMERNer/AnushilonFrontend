import { usePaperSetStore } from "@/store/paper-set-store";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { toBnDigits } from "@/lib/helpers";
import { setLabels } from "@/lib/paper-set";
import { clsx } from "clsx";

export const PaperSetPicker = () => {
    const setCount = usePaperSetStore((s) => s.setCount);
    const activeSetIndex = usePaperSetStore((s) => s.activeSetIndex);
    const setSetCount = usePaperSetStore((s) => s.setSetCount);
    const setActiveSet = usePaperSetStore((s) => s.setActiveSet);
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-dashed p-1 sm:p-2 rounded-lg space-y-2">
            <div className="relative">
                <button
                    className="flex items-center justify-between w-full border border-border rounded-lg px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span>{setCount ? `${toBnDigits(setCount)} সেট` : "সেট তৈরী করুন"}</span>
                    <Shuffle size={14} />
                </button>

                {open && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card shadow-lg p-1">
                        {[2, 3, 4, 5, 6].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => {
                                    setSetCount(n);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-accent",
                                    setCount === n && "bg-primary/10 text-primary font-medium"
                                )}
                            >
                                {toBnDigits(n)} সেট
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {setCount > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                    {setLabels.slice(0, setCount).map((label, index) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setActiveSet(index)}
                            className={clsx(
                                "rounded-lg border py-2 text-sm font-semibold transition-colors",
                                activeSetIndex === index
                                    ? "border-primary bg-primary text-white"
                                    : "border-border text-foreground hover:border-primary/50"
                            )}
                        >
                            সেট {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}