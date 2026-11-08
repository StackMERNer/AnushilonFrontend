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
  email: string;
  name?: string;
  photoURL?: string;
  class: {
    _id: string;
    name: string;
  };
  stream?: string;
  role: "teacher" | "admin" | "student";
  institute?: IInstitute;
  subjectWiseSubscription: ISubjectSubscription[];
  subscription: {
    startedAt: Date;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
