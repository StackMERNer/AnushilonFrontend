"use client";

import { useClasses } from "@/hooks/use-academic";
import { useState } from "react";
import { AcademicTreeManager } from "./_components/AcademicTreeManager";

const SubjectsPage = () => {
    const { data: classes, isLoading, isError } = useClasses();

    const [selectedClassId, setSelectedClassId] = useState("");

    const activeClassId = selectedClassId || classes?.[0]?._id || "";

    if (isLoading) {
        return (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
                <div className="mb-6">
                    <div className="h-7 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-96 mt-2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>

                <div className="h-10 w-56 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
        );
    }

    if (isError || !classes?.length) {
        return (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
                <p className="text-sm text-red-500">
                    কোনো শ্রেণী পাওয়া যায়নি।
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen dark:bg-slate-950">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Academic Structure Manager
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Toggle visibility and edit names for subjects, chapters,
                    and topics.
                </p>
            </div>

            {/* Class selector */}
            <div className="mb-6">
                <label
                    htmlFor="class"
                    className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    Class
                </label>

                <select
                    id="class"
                    value={activeClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full sm:w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                    {classes.map((classItem) => (
                        <option
                            key={classItem._id}
                            value={classItem._id}
                        >
                            {classItem.name}
                        </option>
                    ))}
                </select>
            </div>

            {activeClassId && (
                <AcademicTreeManager classId={activeClassId} />
            )}
        </div>
    );
};

export default SubjectsPage;