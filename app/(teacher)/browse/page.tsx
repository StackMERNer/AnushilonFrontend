'use client';

import SubjectList from '@/components/bank/subject-list';
import { useAcademicTree } from '@/hooks/use-academic';
import { useUserProfile } from '@/hooks/useUserProfile';

const BrowseSubjects = () => {
    const { data: user } = useUserProfile();
    const { data: subjects } = useAcademicTree({
        upto: "topic",
        classId: user?.class._id,
        stream: user?.stream
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 max-w-2xl mx-auto pb-6">
            <SubjectList baseUrl='/browse' subjects={subjects} />
        </div>
    );
};

export default BrowseSubjects;