export type UserModel = {
  id: string;
  username: string;
  name: string;
  password: string;
  salary: number;
  role: string;
  token: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
};

export type UserRes = Omit<
  UserModel,
  "password" | "salary" | "created_by" | "updated_by"
>;
