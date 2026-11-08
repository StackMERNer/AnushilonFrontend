
import React from "react";
import clsx from "clsx";

type ButtonVariant =
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "secondary"
    | "outline"
    | "dark";

type ButtonSize = "sm" | "md" | "lg" | "xl";

interface Button3DProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
    primary:
        "bg-blue-500 border-blue-600 shadow-[0_5px_0_0_#1d4ed8] hover:bg-blue-400",
    success:
        "bg-green-500 border-green-600 shadow-[0_5px_0_0_#15803d] hover:bg-green-400",
    danger:
        "bg-red-500 border-red-600 shadow-[0_5px_0_0_#b91c1c] hover:bg-red-400",
    warning:
        "bg-yellow-400 border-yellow-500 shadow-[0_5px_0_0_#ca8a04] hover:bg-yellow-300 text-yellow-950",
    secondary:
        "bg-slate-200 border-slate-300 shadow-[0_5px_0_0_#94a3b8] hover:bg-slate-100 text-slate-800",
    outline:
        "bg-white border-2 border-slate-200 shadow-[0_5px_0_0_#cbd5e1] hover:bg-slate-50 text-slate-700",
    dark:
        "bg-slate-700 border-slate-800 shadow-[0_5px_0_0_#334155] hover:bg-slate-600",
};

const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-5 py-2.5 text-base rounded-xl",
    lg: "px-7 py-3 text-lg rounded-2xl",
    xl: "px-9 py-4 text-xl rounded-2xl",
};

export function Button3D({
    variant = "primary",
    size = "md",
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
}: Button3DProps) {
    return (
        <button
            disabled={disabled}
            className={clsx(
                "inline-flex items-center justify-center gap-2",
                "font-bold border-b-0 border-x-0 border-t-0",
                "text-white transition-all duration-100",
                "active:translate-y-[5px] active:shadow-none",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "disabled:translate-y-0",
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
