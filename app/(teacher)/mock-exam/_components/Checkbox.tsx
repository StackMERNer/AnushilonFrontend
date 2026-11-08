interface Props {
    checked: boolean;
    indeterminate?: boolean;
    className?: string;
}

/** Visual-only checkbox; the parent element handles the click. */
export default function Checkbox({ checked, indeterminate, className = "" }: Props) {
    const on = checked || indeterminate;
    return (
        <span
            aria-hidden="true"
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${on
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-slate-300 bg-white"
                } ${className}`}
        >
            {indeterminate && !checked ? (
                <span className="h-0.5 w-2.5 rounded bg-white" />
            ) : checked ? (
                <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                    <path
                        d="m4 10 4 4 8-8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : null}
        </span>
    );
}