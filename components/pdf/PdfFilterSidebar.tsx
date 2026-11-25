
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import clsx from "clsx";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAcademicTree } from "@/hooks/use-academic";

function RadioDot({ checked }: { checked: boolean }) {
    return (
        <span
            className={clsx(
                "flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                checked
                    ? "border-teal bg-teal/10"
                    : "border-muted-foreground/40"
            )}
        >
            {checked && (
                <span className="size-1.5 rounded-full bg-teal" />
            )}
        </span>
    );
}

// Moved outside PdfFilterSidebar
function Item({
    id,
    name,
    selected,
    onClick,
}: {
    id: string;
    name: string;
    selected: boolean;
    onClick: (id: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onClick(id)}
            className={clsx(
                "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-all",
                selected
                    ? "border-teal/40 bg-teal-tint font-medium"
                    : "border-border bg-card hover:bg-accent/50"
            )}
        >
            <RadioDot checked={selected} />
            <span className="truncate">{name}</span>
        </button>
    );
}

export default function PdfFilterSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const [, startTransition] = useTransition();

    const subjectId = sp.get("subjectId") ?? "";

    const { data: user } = useUserProfile();

    const { data: subjects = [], isLoading } = useAcademicTree({
        upto: "subject",
        enabled: !!user?.profile,
        trackKey: user?.activeTrackId ?? undefined,
    });

    const choose = (id: string) => {
        const params = new URLSearchParams(sp.toString());

        if (id) {
            params.set("subjectId", id);
        } else {
            params.delete("subjectId");
        }

        params.delete("page");

        startTransition(() =>
            router.push(`${pathname}?${params.toString()}`)
        );
    };

    return (
        <aside className="w-full space-y-2 rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                বিষয়
            </div>

            {isLoading ? (
                <div className="h-9 animate-pulse rounded-lg bg-muted" />
            ) : (
                <div className="space-y-1">
                    <Item
                        id=""
                        name="সব বিষয়"
                        selected={subjectId === ""}
                        onClick={choose}
                    />

                    {(subjects as any[]).map((s) => (
                        <Item
                            key={s._id}
                            id={s._id}
                            name={s.name}
                            selected={subjectId === s._id}
                            onClick={choose}
                        />
                    ))}
                </div>
            )}
        </aside>
    );
}
