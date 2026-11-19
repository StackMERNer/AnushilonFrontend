"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { RetryItem, currentHref, useBankSession } from "@/lib/bank-session";
import { toBnDigits } from "@/lib/helpers";

const SCROLL_KEY = "bank:scrollTo";

function flash(id: string) {
    const el = document.getElementById(`q-${id}`);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-gold");
    setTimeout(() => el.classList.remove("ring-2", "ring-gold"), 1600);
    return true;
}

const pageOf = (href: string) => {
    const page = new URLSearchParams(href.split("?")[1] ?? "").get("page") ?? "1";
    const parsed = Number.parseInt(page, 10);
    return Number.isFinite(parsed) ? parsed : 1;
};

function useRetryNav() {
    const router = useRouter();
    usePathname(); // re-render on navigation so `href` stays current
    useSearchParams();
    const href = currentHref();
    const { retry } = useBankSession();

    const here = retry.filter((r) => r.href === href);
    const elsewhere = retry.filter((r) => r.href !== href);

    const go = (item: RetryItem) => {
        if (item.href === href) {
            flash(item.id);
            return;
        }
        try {
            sessionStorage.setItem(SCROLL_KEY, item.id);
        } catch { }
        router.push(item.href);
    };

    return { here, elsewhere, total: retry.length, go };
}

/** After navigating from another page, scroll to the requested question once the list has loaded. */
function useScrollOnArrival() {
    useEffect(() => {
        let id: string | null = null;
        try {
            id = sessionStorage.getItem(SCROLL_KEY);
        } catch { }
        if (!id) return;

        let tries = 0;
        const timer = setInterval(() => {
            if (flash(id!) || ++tries > 20) {
                clearInterval(timer);
                try {
                    sessionStorage.removeItem(SCROLL_KEY);
                } catch { }
            }
        }, 150);
        return () => clearInterval(timer);
    }, []);
}

export function RetryPill() {
    const { here, elsewhere, total, go } = useRetryNav();
    const cursor = useRef(0);
    useScrollOnArrival();

    if (total === 0) return null;

    const onClick = () => {
        const list = here.length ? here : elsewhere;
        go(list[cursor.current++ % list.length]);
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="fixed bottom-5 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-95"
        >
            <RotateCcw className="size-4" />
            আবার দেখো ({toBnDigits(total)})
        </button>
    );
}

export function RetrySection() {
    const { here, elsewhere, go } = useRetryNav();
    if (!here.length && !elsewhere.length) return null;

    // group other pages by URL
    const groups = new Map<string, RetryItem[]>();
    elsewhere.forEach((r) => groups.set(r.href, [...(groups.get(r.href) ?? []), r]));

    return (
        <section className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <RotateCcw className="size-4 text-red-500" />
                আবার দেখা দরকার
            </h3>

            {here.length > 0 && (
                <div className="mb-3">
                    <p className="mb-1.5 text-xs text-muted-foreground">
                        এই পেজে {toBnDigits(here.length)}টি প্রশ্ন
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {here.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => go(r)}
                                className="rounded-full border border-red-500/40 bg-card px-3 py-1 text-sm font-semibold transition hover:bg-red-500/10"
                            >
                                প্রশ্ন {r.no ? toBnDigits(r.no) : "—"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {[...groups.entries()].map(([href, items]) => (
                <button
                    key={href}
                    type="button"
                    onClick={() => go(items[0])}
                    className="mr-2 mt-1 rounded-full border border-line bg-card px-3 py-1 text-sm transition hover:bg-accent"
                >
                    পেজ {toBnDigits(pageOf(href))}-এ {toBnDigits(items.length)}টি →
                </button>
            ))}
        </section>
    );
}