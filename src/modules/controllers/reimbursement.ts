import { Context, HonoRequest } from "hono";
import * as service from "../services/reimbursement";
import { GeneralResponse, UserRes } from "../../types";
import { CreateReimbursementPipe, CheckerPipe, SearchPipe } from "../../pipes/reimbursement";

export const createReimbursement = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreateReimbursementPipe(body, user);
  const data = await service.createReimbursement(validation, user);
  return { message: "success create new reimbursement", data, code: 201 };
};

export const showReimbursement = async (c: Context): Promise<GeneralResponse> => {
  const data = await CheckerPipe(c);
  return { message: null, data, code: 200 };
};

export const indexReimbursement = async (c: Context): Promise<GeneralResponse> => {
  const data = await service.indexReimbursement(SearchPipe(c));
  return { message: null, data, code: 200 };
};
