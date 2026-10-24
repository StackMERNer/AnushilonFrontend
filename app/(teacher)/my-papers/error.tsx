// app/my-papers/error.tsx
'use client';

import { AxiosError } from "axios";

export default function Error({
    error,
    reset,
}: {
    error: AxiosError & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="p-4 border border-red-200 rounded max-w-[70vw] md:max-w-[50vw] mx-auto flex flex-col items-center justify-center">
            <h2 className="text-red-600 font-bold">কিছু ভুল হয়েছে!</h2>
            <p className="text-sm text-gray-600 mb-4">{error?.message}</p>
            {/* <button
                onClick={() => reset()}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
                আবার চেষ্টা করুন
            </button> */}
        </div>
    );
}