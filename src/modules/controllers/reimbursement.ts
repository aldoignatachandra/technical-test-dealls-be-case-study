import { HonoRequest } from "hono";
import * as service from "../services/reimbursement";
import { GeneralResponse, UserRes } from "../../types";
import { CreateReimbursementPipe } from "../../pipes/reimbursement/create";

export const createReimbursement = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreateReimbursementPipe(body, user);
  const data = await service.createReimbursement(validation, user);
  return { message: "success create new reimbursement", data, code: 201 };
};
