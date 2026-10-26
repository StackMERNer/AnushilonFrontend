'use client';
import { useAcademicTree } from '@/hooks/use-academic';
import { getSubjectIconByName } from '@/lib/subjectImageMap';
import { useRouter } from 'next/navigation';
import React from 'react'

const QuestionBankPage = () => {
    const { data: subjects } = useAcademicTree({
        upto: "topic",
        classId: "6a6e31bdd2ea30ebd6a29ded",
    });
    const router = useRouter();
    const handleSubjectClick = (subjectId: string) => {
        router.push(`/question-bank/${subjectId}`);
    }
    return (
        <div>
            <div className="flex flex-col gap-2 px-3">
                {subjects?.map((subject) => (
                    <div onClick={() => handleSubjectClick(subject._id)} key={subject._id} className="flex items-center gap-2 cursor-pointer">
                        <img className="w-8 h-8" src={getSubjectIconByName(subject.name)} alt={subject.name} />
                        <div>{subject.name}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default QuestionBankPage