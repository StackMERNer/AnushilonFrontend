"use client";

import { useEffect } from "react";

export default function BookmarksError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to your monitoring service
        console.error("Bookmarks page error:", error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold">
                বুকমার্ক লোড করা যায়নি
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
                প্রশ্নগুলো লোড করার সময় একটি সমস্যা হয়েছে।
                আবার চেষ্টা করুন।
            </p>

            <button
                onClick={() => reset()}
                className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
                আবার চেষ্টা করুন
            </button>

            {process.env.NODE_ENV === "development" && (
                <pre className="mt-6 max-w-full overflow-auto text-left text-xs text-red-500">
                    {error.message}
                </pre>
            )}
        </div>
    );
}