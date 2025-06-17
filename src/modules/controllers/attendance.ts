import { Context, HonoRequest } from "hono";
import * as service from "../services/attendance";
import { GeneralResponse, UserRes } from "../../types";
import { CreateAttendancePipe, CheckerPipe, SearchPipe } from "../../pipes/attendance";

export const createAttendance = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreateAttendancePipe(body, user);
  const data = await service.createAttendance(validation, user);
  return { message: "success create new attendance", data, code: 201 };
};

export const showAttendance = async (c: Context): Promise<GeneralResponse> => {
  const data = await CheckerPipe(c);
  return { message: null, data, code: 200 };
};

export const indexAttendance = async (c: Context): Promise<GeneralResponse> => {
  const data = await service.indexAttendance(SearchPipe(c));
  return { message: null, data, code: 200 };
};
