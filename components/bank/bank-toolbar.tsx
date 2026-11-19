"use client";

import { motion } from "framer-motion";
import { Flame, RotateCcw } from "lucide-react";
import { usePersistentFlag } from "@/hooks/use-persistent-flag";
import { resetBankSession, useBankSession } from "@/lib/bank-session";
import { FUN_MODE_KEY } from "@/lib/fun";
import { toBnDigits } from "@/lib/helpers";
import DailyGoalRing from "@/components/fun/daily-goal-ring";
import ToggleSwitch from "./toggle-switch";

export default function BankToolbar({
    srs,
    onSrsChange,
}: {
    srs: boolean;
    onSrsChange: (v: boolean) => void;
}) {
    const [fun, setFun] = usePersistentFlag(FUN_MODE_KEY, true);
    const s = useBankSession();
    const accuracy = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;

    return (
        <section className="mb-3 space-y-3 rounded-2xl border border-line bg-card p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <DailyGoalRing />

                {fun && s.streak >= 2 && (
                    <motion.span
                        key={s.streak}
                        initial={{ scale: 1.35 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red/30 bg-red-tint px-3 py-1.5 text-sm font-bold text-red"
                    >
                        <Flame className="size-4 fill-current" />
                        {toBnDigits(s.streak)} টানা
                    </motion.span>
                )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <ToggleSwitch
                    checked={srs}
                    onChange={onSrsChange}
                    label="স্টাডি মোড"
                    hint={
                        srs
                            ? "উত্তর দেখে মূল্যায়ন করলে প্রশ্নটি রিভিউতে যুক্ত হবে"
                            : "চালু করলে প্রশ্ন মূল্যায়ন করে রিভিউতে যুক্ত করতে পারবে"
                    }
                />
                <ToggleSwitch
                    checked={fun}
                    onChange={setFun}
                    label="মজার মোড"
                    hint="টানা সঠিক উত্তরে কনফেটি ও মজার বার্তা"
                />
            </div>

            {s.answered > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5 text-xs text-muted-foreground">
                    <span>
                        এই সেশনে: {toBnDigits(s.answered)}টি MCQ · {toBnDigits(accuracy)}% সঠিক · সেরা ধারা{" "}
                        {toBnDigits(s.bestStreak)}
                    </span>
                    <button
                        type="button"
                        onClick={resetBankSession}
                        className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                    >
                        <RotateCcw className="size-3" />
                        নতুন সেশন
                    </button>
                </div>
            )}
        </section>
    );
}