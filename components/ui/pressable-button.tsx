import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const pressableButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap font-bold transition-all duration-75 select-none active:translate-y-[4px] active:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0 disabled:active:border-b-4",
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-primary-foreground border-b-[4px] border-[color-mix(in_srgb,var(--primary),black_25%)] drop-shadow-sm hover:brightness-105 active:brightness-95",
                ghost:
                    "bg-transparent text-slate-800 border-b-[4px] border-slate-300 drop-shadow-sm hover:bg-slate-50 active:bg-slate-100",
                secondary:
                    "bg-slate-100 text-slate-800 border-b-[4px] border-slate-300 drop-shadow-sm hover:bg-slate-200/80 active:bg-slate-200",
                outline:
                    "bg-white text-slate-700 border-2 border-b-[4px] border-slate-200 hover:bg-slate-50 active:bg-slate-100",
                danger:
                    "bg-rose-500 text-white border-b-[4px] border-rose-700 drop-shadow-sm hover:bg-rose-600 active:bg-rose-700",
                success:
                    "bg-emerald-500 text-white border-b-[4px] border-emerald-700 drop-shadow-sm hover:bg-emerald-600 active:bg-emerald-700",
            },
            size: {
                default: "h-10 px-4 py-2 rounded-xl text-sm",
                sm: "h-8 px-3 py-1.5 rounded-lg text-xs",
                lg: "h-12 px-6 py-3 rounded-2xl text-base",
                icon: "h-10 w-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface PressableButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pressableButtonVariants> {
    href?: string;
    isLoading?: boolean;
}

const PressableButton = React.forwardRef<HTMLButtonElement, PressableButtonProps>(
    (
        {
            className,
            variant,
            size,
            href,
            isLoading = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const combinedClasses = cn(pressableButtonVariants({ variant, size, className }));

        const content = isLoading ? (
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>{children}</span>
            </>
        ) : (
            children
        );

        // If an `href` prop is passed, render a Next.js Link instead
        if (href) {
            return (
                <Link href={href} className={combinedClasses}>
                    {content}
                </Link>
            );
        }

        return (
            <button
                ref={ref}
                className={combinedClasses}
                disabled={disabled || isLoading}
                {...props}
            >
                {content}
            </button>
        );
    }
);

PressableButton.displayName = "PressableButton";

export { PressableButton, pressableButtonVariants };