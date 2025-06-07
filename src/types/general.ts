import { UserRes } from "./user";

export type GeneralResponse = {
  message: string | null;
  data: unknown;
  code: number;
};

export type UserMiddleware = {
  user: UserRes;
};
