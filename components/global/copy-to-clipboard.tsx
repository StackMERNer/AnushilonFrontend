import clsx from "clsx";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const CopyToClipboard = ({
    data,
    className,
    onCopy
}: {
    data: any;
    className?: string;
    onCopy?: () => void;
}) => {
    return (
        <span
            className={clsx(
                "p-1 rounded-lg dark:bg-slate-700 bg-gray-200 cursor-pointer",
                className
            )}
            onClick={() => {
                navigator.clipboard.writeText(data);
                toast.success(`কপি করা হয়েছে: ${data}`);
                onCopy?.();
            }}
        >
            <Copy />
        </span>
    );
};

export default CopyToClipboard;
