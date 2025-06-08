import { HonoRequest } from "hono";
import * as service from "../services/overtime";
import { GeneralResponse, UserRes } from "../../types";
import { CreateOvertimePipe } from "../../pipes/overtime/create";

export const createOvertime = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreateOvertimePipe(body, user);
  const data = await service.createOvertime(validation, user);
  return { message: "success create new overtime", data, code: 201 };
};
