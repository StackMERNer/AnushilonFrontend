'use client';

import Link from 'next/link';
import { useAcademicTree } from '@/hooks/use-academic';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getSubjectIconByName } from '@/lib/subjectImageMap';

const BrowseSubjects = () => {
    const { data: user } = useUserProfile();
    const { data: subjects } = useAcademicTree({
        upto: "topic",
        classId: user?.class._id,
        stream: user?.stream
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 max-w-2xl mx-auto">
            {subjects?.map((subject) => (
                <Link
                    key={subject._id}
                    href={`/browse/${subject._id}`}
                    className="
                        flex items-center gap-3 px-5 py-4
                        rounded-2xl cursor-pointer
                        bg-white hover:bg-neutral-50
                        dark:bg-transparent dark:hover:bg-white/[0.03]
                        border-2 border-b-4
                        border-neutral-200 dark:border-[#24253a]
                        transition-all duration-150
                        active:border-b-2 active:translate-y-0.5
                    "
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="w-7 h-7 object-contain"
                        src={getSubjectIconByName(subject.name)}
                        alt={subject.name}
                    />
                    <span className="text-neutral-900 dark:text-white font-semibold text-base">
                        {subject.name}
                    </span>
                </Link>
            ))}
        </div>
    );
};

export default BrowseSubjects;