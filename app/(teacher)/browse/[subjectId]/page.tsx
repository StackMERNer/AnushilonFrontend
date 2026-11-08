import ChapterProgressList from '@/components/study/chapter-progress-list';

export default async function BrowseSubject({ params }: { params: Promise<{ subjectId: string }> }) {
    const { subjectId } = await params;
    return (
        < ChapterProgressList subjectId={subjectId} />
    )
}
