"use client";

import { useClasses, useAcademicTree } from "@/hooks/use-academic";
import { getMaxPrice } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SelectedSubject = {
    subjectId: string;
    price: number;
};

const SUBJECT_PRICE = 100;


interface Subject {
    _id: string;
    name: string;
}

interface Class {
    _id: string;
    name: string;
}

const ClassSubjectCard = ({
    classItem,
    selectedSubjects,
    onToggleSubject,
}: {
    classItem: Class;
    selectedSubjects: SelectedSubject[];
    onToggleSubject: (subjectId: string) => void;
}) => {
    const { data, isLoading } = useAcademicTree({
        classId: classItem._id,
        upto: "subject",
    });

    // Adjust this depending on the exact response of getAcademicTree().
    const subjects: Subject[] = data ?? [];

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-bold">{classItem.name}</h2>
                <p className="text-sm text-muted-foreground">
                    আপনার প্রয়োজনীয় বিষয় নির্বাচন করুন
                </p>
            </div>

            {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    বিষয়গুলো লোড হচ্ছে...
                </div>
            ) : subjects.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    কোনো বিষয় পাওয়া যায়নি।
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => {
                        const selected = selectedSubjects.some(
                            (item) => item.subjectId === subject._id
                        );

                        return (
                            <button
                                key={subject._id}
                                type="button"
                                onClick={() => onToggleSubject(subject._id)}
                                className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${selected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50 hover:bg-muted/40"
                                    }`}
                            >
                                <div>
                                    <p className="font-medium">{subject.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {SUBJECT_PRICE} টাকা / বছর
                                    </p>
                                </div>

                                <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                                        ? "border-primary bg-primary text-white"
                                        : "border-muted-foreground/40"
                                        }`}
                                >
                                    {selected && (
                                        <span className="text-xs font-bold">✓</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const SelectSubjectsPage = () => {
    const router = useRouter();

    const { data: classes, isLoading } = useClasses();

    const [selectedSubjects, setSelectedSubjects] = useState<
        SelectedSubject[]
    >([]);

    const totalPrice = useMemo(() => {
        const maxPrice = getMaxPrice();
        const total = selectedSubjects.reduce(
            (total, subject) => total + subject.price,
            0
        );
        return total > maxPrice ? maxPrice : total;
    }, [selectedSubjects]);

    const toggleSubject = (subjectId: string) => {
        setSelectedSubjects((current) => {
            const alreadySelected = current.some(
                (item) => item.subjectId === subjectId
            );

            if (alreadySelected) {
                return current.filter((item) => item.subjectId !== subjectId);
            }

            // if (current.length >= MAX_SUBJECTS) {
            //     alert(
            //         "আপনি সর্বোচ্চ ১২টি বিষয় নির্বাচন করতে পারবেন। ১২টির বেশি বিষয় প্রয়োজন হলে সম্পূর্ণ সাবস্ক্রিপশন কিনুন।"
            //     );

            //     return current;
            // }

            return [
                ...current,
                {
                    subjectId,
                    price: SUBJECT_PRICE,
                },
            ];
        });
    };

    const handleContinue = () => {
        if (selectedSubjects.length === 0) {
            alert("কমপক্ষে একটি বিষয় নির্বাচন করুন।");
            return;
        }

        /*
         * Example:
         * mathId_100,physicsId_100,chemistryId_100
         */
        const subjectsParam = selectedSubjects
            .map((subject) => `${subject.subjectId}_${subject.price}`)
            .join(",");

        const params = new URLSearchParams({
            plan: "subject_yearly",
            subjects: subjectsParam,
        });

        router.push(`/payment-methods?${params.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <p className="text-muted-foreground">ক্লাসগুলো লোড হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    বিষয় নির্বাচন করুন
                </h1>

                <p className="mt-2 text-muted-foreground">
                    আপনার প্রয়োজনীয় বিষয়গুলো নির্বাচন করে সাবস্ক্রিপশন নিন।
                </p>
            </div>

            {/* Classes */}
            <div className="space-y-6 pb-32">
                {classes?.map((classItem: Class) => (
                    <ClassSubjectCard
                        key={classItem._id}
                        classItem={classItem}
                        selectedSubjects={selectedSubjects}
                        onToggleSubject={toggleSubject}
                    />
                ))}
            </div>

            {/* Bottom summary */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 p-4 shadow-lg backdrop-blur dark:bg-neutral-950/95">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            নির্বাচিত বিষয়
                        </p>

                        <p className="font-semibold">
                            {selectedSubjects.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                মোট মূল্য
                            </p>

                            <p className="text-xl font-bold">
                                {totalPrice} টাকা
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={selectedSubjects.length === 0}
                            onClick={handleContinue}
                            className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            পেমেন্ট করুন
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectSubjectsPage;