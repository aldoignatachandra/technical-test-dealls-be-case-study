import { z } from "zod";
import { UserRes } from "./user";
import { idValidation } from "../validations/general";

export type GeneralResponse = {
  message: string | null;
  data: unknown;
  code: number;
};

export type UserMiddleware = {
  user: UserRes;
};

export type PaginationResponse = {
  data: unknown;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

export type IdParam = z.infer<typeof idValidation>;

export type SearchQuery = {
  data: unknown;
  total: number;
  total_row: number;
};
