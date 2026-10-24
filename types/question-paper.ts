import { IChapter, IClass, ISubject } from "./academic";
import { IQuestion } from "./question";

export type PaperQuestionType = "mcq" | "cq" | "short" | string;

// ======================================================
// Subject
// ======================================================

export interface IQuestionPaperSubject {
  subject: string; // subjectId
  chapters: string[];
}

// ======================================================
// Section Items
// ======================================================

export interface IPaperTextItem {
  _id: string;
  type: "text";
  content: string; // rich HTML
}

export interface IPaperQuestionHeadingItem {
  _id: string;
  type: "question_heading";

  // Used to determine which default heading to render
  questionType: PaperQuestionType;

  // If undefined, render the default heading.
  // Otherwise render this custom rich HTML.
  content?: string;
}

export interface IPaperQuestionItem {
  _id: string;
  type: "question";
  question: string;
  questionNo?: string;
}

export type IPaperSectionItem =
  | IPaperTextItem
  | IPaperQuestionHeadingItem
  | IPaperQuestionItem;

// ======================================================
// Section
// ======================================================

export interface IPaperSection {
  _id: string;
  type: PaperQuestionType;
  items: IPaperSectionItem[];
}

// ======================================================
// Question Paper
// ======================================================

export interface IQuestionPaper {
  _id: string;

  title: string;
  instruction?: string; // rich HTML

  class: string;
  subjects: IQuestionPaperSubject[];

  totalMarks: number;
  duration: number; // in minutes

  sections: IPaperSection[];

  createdBy?: string;
  updatedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

// ======================================================
// Populated Section Items
// ======================================================

export interface IPopulatedPaperQuestionItem extends Omit<
  IPaperQuestionItem,
  "question"
> {
  question: IQuestion | null; // question can be missing (if deleted)
}

export type IPopulatedPaperSectionItem =
  | IPaperTextItem
  | IPaperQuestionHeadingItem
  | IPopulatedPaperQuestionItem;

// ======================================================
// Populated Section
// ======================================================

export interface IPopulatedPaperSection extends Omit<IPaperSection, "items"> {
  items: IPopulatedPaperSectionItem[];
}

// ======================================================
// Populated Question Paper
// ======================================================

export interface IPopulatedQuestionPaper extends Omit<
  IQuestionPaper,
  "sections" | "subjects" | "class"
> {
  class: IClass;
  subjects: {
    subject: ISubject;
    chapters: IChapter[];
  }[];
  sections: IPopulatedPaperSection[];
}

// ======================================================
// Filtered / List Response
// ======================================================

export interface IFilterdPaper extends Omit<
  IQuestionPaper,
  "class" | "subjects"
> {
  class: IClass;
  subjects: {
    subject: ISubject;
    chapters: IChapter[];
  }[];
}

export interface ICustomQuestionPaper extends Omit<
  IPopulatedQuestionPaper,
  "sections" | "subjects" | "class"
> {
  sections: IPopulatedPaperSection[];
  subjects: {
    subject: {
      _id: string;
      name: string;
      subjectCode: string;
    };
    chapters: IChapter[];
  }[];
  class: {
    _id: string;
    name: string;
  };
}
