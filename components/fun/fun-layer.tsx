"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePersistentNumber } from "@/hooks/use-persistent-flag";
import { markGoalCelebrated, useDailyProgress } from "@/lib/daily-goal";
import { celebrateGoal } from "@/lib/fun";

export default function FunLayer() {
    const [text, setText] = useState<string | null>(null);
    const [goal] = usePersistentNumber("daily:goal", 20);
    const { count, celebrated } = useDailyProgress();

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const onToast = (e: Event) => {
            setText((e as CustomEvent<{ text: string }>).detail.text);
            clearTimeout(timer);
            timer = setTimeout(() => setText(null), 2600);
        };
        window.addEventListener("fun:toast", onToast);
        return () => {
            window.removeEventListener("fun:toast", onToast);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (goal > 0 && count >= goal && !celebrated) {
            markGoalCelebrated(); // once per day, even if fun mode is off
            celebrateGoal();
        }
    }, [count, goal, celebrated]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-16 z-[70] flex justify-center px-4"
        >
            <AnimatePresence>
                {text && (
                    <motion.div
                        key={text}
                        initial={{ opacity: 0, y: -16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="max-w-[90vw] rounded-2xl border border-gold/40 bg-card px-5 py-3 text-center text-base font-bold text-foreground shadow-xl"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}