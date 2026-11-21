'use client';

import SubjectList from '@/components/bank/subject-list';
import { useAcademicTree } from '@/hooks/use-academic';
import { useUserProfile } from '@/hooks/useUserProfile';

const BrowseSubjects = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 max-w-2xl mx-auto pb-6">
            <SubjectList baseUrl='/browse' />
        </div>
    );
};

export default BrowseSubjects;