import { IProfile } from "./profile";

interface IInstitute {
  name: string;
  address: string;
  type: string; // coaching, school, college, others
  phone: string;
}

export interface ISubjectSubscription {
  subjectId: string;
  startedAt: string;
  expiresAt: string;
}

export interface IUser extends Document {
  _id: string;
  uid: string;
  anushilonUid?: string;
  email: string;
  name?: string;
  photoURL?: string;
  class: {
    _id: string;
    name: string;
  };
  stream?: string;
  role?: "teacher" | "admin";
  anushilonRole?: "student" | "admin";
  anushilonSubscription?: {
    startedAt: Date;
    expiresAt: Date;
  };
  profile?: IProfile;
  activeTrackId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
