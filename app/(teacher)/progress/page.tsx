
import ChapterProgressList from '@/components/study/chapter-progress-list'
import { useAcademicTree } from '@/hooks/use-academic';
import React from 'react'

const page = () => {

    return (
        <div>
            {<ChapterProgressList subjectId={"6a6e31bdd2ea30ebd6a29e1e"} />}
            {/* {<ChapterProgressList subjectId={"6a6e31bcd2ea30ebd6a299f1"} />} */}
        </div>
    )
}

export default page