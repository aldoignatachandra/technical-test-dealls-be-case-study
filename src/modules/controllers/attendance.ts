import { HonoRequest } from "hono";
import * as service from "../services/attendance";
import { GeneralResponse, UserRes } from "../../types";
import { CreateAttendancePipe } from "../../pipes/attendance/create";

export const createAttendance = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreateAttendancePipe(body, user);
  const data = await service.createAttendance(validation, user);
  return { message: "success create new attendance", data, code: 201 };
};
