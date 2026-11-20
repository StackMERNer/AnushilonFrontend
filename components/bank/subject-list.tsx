import { getSubjectIconByName } from '@/lib/subjectImageMap'
import { ISubject } from '@/types/academic'
import Link from 'next/link'

const SubjectList = ({ baseUrl, subjects }: { baseUrl: string, subjects?: ISubject[] }) => {
    return (
        <>
            {subjects?.map((subject) => (
                <Link
                    key={subject._id}
                    href={`${baseUrl}/${subject._id}`}
                    className="
                        flex items-center gap-3 px-5 py-4
                        rounded-2xl cursor-pointer
                        bg-white hover:bg-neutral-50
                        dark:bg-transparent dark:hover:bg-white/3
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
        </>
    )
}

export default SubjectList