interface IExamConfigSubjectChapter {
  chapter: string; // chapterId;
  topics: string[]; // topicIds
  questionCount?: number;
  questionType?: string;
}

interface IExamConfigSubject {
  name: string; // subject name
  subject: string; // subjectId;
  chapters: IExamConfigSubjectChapter[];
  questionCount: number;
  questionType: string;
}

interface IExamConfig {
  _id: string;
  name: string;
  duration: number;
  negativeMarking: boolean;
  subjects: IExamConfigSubject[];
  startedAt: Date;
  submittedAt: Date;
}
