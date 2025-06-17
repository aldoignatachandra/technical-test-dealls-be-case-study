import { Context, HonoRequest } from "hono";
import * as service from "../services/payroll";
import { GeneralResponse, UserRes } from "../../types";
import { CreatePayrollPipe } from "../../pipes/payroll";
import { CheckerPipe, SummaryPipe } from "../../pipes/payroll";

export const processPayroll = async (
  body: HonoRequest,
  user: UserRes
): Promise<GeneralResponse> => {
  const validation = await CreatePayrollPipe(body, user);
  const data = await service.createPayroll(validation, user);
  return { message: "success generate payroll", data, code: 201 };
};

export const showDetailPayslips = async (c: Context): Promise<GeneralResponse> => {
  const validation = await CheckerPipe(c);
  const data = await service.showDetailPayslips(validation, c.get("user"));
  return { message: null, data, code: 200 };
};

export const getPayrollSummary = async (c: Context): Promise<GeneralResponse> => {
  const validation = await SummaryPipe(c);
  const data = await service.SummaryPayslipsByPeriod(validation, c.get("user"));
  return { message: null, data, code: 200 };
};
