import { Context, HonoRequest } from "hono";
import * as service from "../services/payroll_period";
import { GeneralResponse, UserRes } from "../../types";
import { CreatePayrollPeriodPipe, CheckerPipe, SearchPipe } from "../../pipes/payroll_period";

export const createPayrollPeriod = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreatePayrollPeriodPipe(body, user);
  const data = await service.createPayrollPeriod(validation, user);
  return { message: "success create new payroll period", data, code: 201 };
};

export const showPayrollPeriod = async (c: Context): Promise<GeneralResponse> => {
  const data = await CheckerPipe(c);
  return { message: null, data, code: 200 };
};

export const indexPayrollPeriod = async (c: Context): Promise<GeneralResponse> => {
  const data = await service.indexPayrollPeriod(SearchPipe(c));
  return { message: null, data, code: 200 };
};
