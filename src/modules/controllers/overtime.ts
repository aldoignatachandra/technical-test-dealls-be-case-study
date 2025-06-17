import { Context, HonoRequest } from "hono";
import * as service from "../services/overtime";
import { GeneralResponse, UserRes } from "../../types";
import { CreateOvertimePipe, CheckerPipe, SearchPipe } from "../../pipes/overtime";

export const createOvertime = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreateOvertimePipe(body, user);
  const data = await service.createOvertime(validation, user);
  return { message: "success create new overtime", data, code: 201 };
};

export const showOvertime = async (c: Context): Promise<GeneralResponse> => {
  const data = await CheckerPipe(c);
  return { message: null, data, code: 200 };
};

export const indexOvertime = async (c: Context): Promise<GeneralResponse> => {
  const data = await service.indexOvertime(SearchPipe(c));
  return { message: null, data, code: 200 };
};
