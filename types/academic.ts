export interface IClass {
  _id: string;
  name: string;
  order: number;
}
export interface ISubject {
  _id: string;
  name: string;
  stream: string;
  chapters: string[];
  subjectCode: string;
  order: number;
  class: string;
}
export type PopulatedSubject = ISubject & { chapters: PopulatedChapter[] };
export type PopulatedChapter = Omit<IChapter, "chapters"> & {
  topics: { name: string; order: number; _id: string }[];
};
export interface IChapter {
  _id?: string;
  name: string;
  subject: string;
  isFree: boolean;
  status: string;
  order: number;
  badge: string[];
  topics: string[];
}

export interface IBoard {
  _id: string;
  name: string;
  acronym?: string;
}

export interface ISchool {
  _id: string;
  name: string;
}
