'use client';
import { useAcademicTree } from '@/hooks/use-academic';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getSubjectIconByName } from '@/lib/subjectImageMap';
import { useRouter } from 'next/navigation';

const QuestionBankPage = () => {
    const { data: user } = useUserProfile();
    const { data: subjects } = useAcademicTree({
        upto: "topic",
        classId: user?.class._id,
        stream: user?.stream
    });
    const router = useRouter();
    const handleSubjectClick = (subjectId: string) => {
        router.push(`/question-bank/${subjectId}`);
    }
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mx-auto pt-5">
                {subjects?.map((subject) => (
                    <div onClick={() => handleSubjectClick(subject._id)} key={subject._id} className="flex flex-col items-center gap-3 px-5 py-4
                        rounded-2xl cursor-pointer
                        bg-white hover:bg-neutral-50
                        dark:bg-transparent dark:hover:bg-white/3
                        border-2 border-b-4
                        border-neutral-200 dark:border-[#24253a]
                        transition-all duration-150
                        active:border-b-2 active:translate-y-0.5
                    ">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-8 h-8" src={getSubjectIconByName(subject.name)} alt={subject.name} />
                        <div>{subject.name}</div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default QuestionBankPage