import clsx from "clsx";

interface ColumnPickerProps<T extends number> {
    value: T;
    options: T[];
    onChange: (v: T) => void;
}

export function ColumnPicker<T extends number>({
    value,
    options,
    onChange,
}: ColumnPickerProps<T>) {
    return (
        <div className="flex gap-2">
            {options.map((cols) => {
                const isSelected = value === cols;

                return (
                    <button
                        key={cols}
                        type="button"
                        onClick={() => onChange(cols)}
                        className={clsx(
                            "group flex h-10 flex-1 items-center justify-center rounded-xl border p-2 transition-all",
                            isSelected
                                ? "border-primary bg-primary/10 shadow-2xs"
                                : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
                        )}
                    >
                        {/* Column Preview Bars */}
                        <div className="flex h-full items-center gap-1 w-full justify-center max-w-9">
                            {Array.from({ length: cols }).map((_, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        "h-full flex-1 rounded-xs transition-colors",
                                        isSelected
                                            ? "bg-primary"
                                            : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                                    )}
                                />
                            ))}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}