'use client';
import SubjectList from '@/components/bank/subject-list';

const QuestionBankPage = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 max-w-2xl mx-auto pb-6">
            <SubjectList baseUrl='/question-bank' />
        </div>
    )
}

export default QuestionBankPage