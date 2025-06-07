import { HonoRequest } from "hono";
import * as service from "../services/payroll_period";
import { CreatePayrollPeriod, GeneralResponse, UserRes } from "../../types";
import { CreatePayrollPeriodPipe } from "../../pipes/payroll_period";

export const createPayrollPeriod = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreatePayrollPeriodPipe(body, user);
  const data = await service.createPayrollPeriod(validation, user);
  return { message: "success create new payroll period", data, code: 200 };
};
