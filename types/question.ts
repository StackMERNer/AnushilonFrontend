import { IBoard, ISchool } from "./academic";

export type QuestionLevel =
  | "knowledge"
  | "comprehension"
  | "application"
  | "skills";
// | string;

export interface IQuestionBoard {
  board: string;
  year: number;
  order: number | null;
}

export interface IQuestionSchool {
  school: string;
  year: number | null;
  order: number | null;
}

export interface IQuestion {
  _id: string;
  type: string; // 'mcq', 'cq', 'short', etc.
  context?: string;
  question: string; // Main question text
  options: string[]; // Options array for MCQs
  correctMcq?: number;
  questions?: {
    question: string;
    answer: string;
  }[];
  answer?: string;

  // Relations to other entities
  subject: string;
  chapter: string;
  topic: string; // single topic
  boards: IQuestionBoard[];
  schools: IQuestionSchool[];

  // Metadata & Taxonomy
  rating?: number;
  tags: string[];
  level?: QuestionLevel;
  difficulty?: string;
  sameContextQuesId?: string;
}

export interface IPopulatedQuestionBoard extends Omit<IQuestionBoard, "board"> {
  board: IBoard;
}
export interface IPopulatedQuestionSchool extends Omit<
  IQuestionSchool,
  "school"
> {
  school: ISchool;
}

export interface IFilterdQuestion extends Omit<
  IQuestion,
  "subject" | "chapter" | "topic" | "boards" | "schools"
> {
  _id: string;
  boards: IPopulatedQuestionBoard[];
  schools: IPopulatedQuestionSchool[];
}
