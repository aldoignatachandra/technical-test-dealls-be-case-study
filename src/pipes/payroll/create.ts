import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreatePayroll, UserRes } from "../../types";
import { CreatePayrollValidation } from "../../validations/payroll";
import { role } from "../../helpers/constant";
import {
  CheckTotalAttendanceInPayrollPeriod,
  ShowBuilder,
} from "../../modules/sql/payroll_period";
import { CheckGeneratedPayroll } from "../../modules/sql/payroll";

export const CreatePayrollPipe = async (
  body: HonoRequest,
  user: UserRes
): Promise<CreatePayroll> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate = await CreatePayrollValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    const errorMessage = error._errors[0] || "Validation error";
    throw new HTTPException(422, {
      res: error,
      message: errorMessage,
    });
  }

  // Only Role 'admin' can generate payroll
  if (user.role !== role.ADMIN) {
    throw new HTTPException(403, {
      message: "You do not have permission to generate a payroll",
    });
  }

  // Check if the generated payroll in the same attendance period is already exist
  const checkGeneratedPayroll = await CheckGeneratedPayroll({
    id: validate.data.payroll_period_id,
  });
  if (checkGeneratedPayroll) {
    throw new HTTPException(400, {
      message: "Payroll for this period has already been generated",
    });
  }

  // Check if the payroll period is exist and status is 'open'
  const checkPayrollPeriod = await ShowBuilder({
    id: validate.data.payroll_period_id,
  });
  if (!checkPayrollPeriod) {
    throw new HTTPException(404, {
      message: "Payroll period not found",
    });
  }
  if (checkPayrollPeriod.status !== "open") {
    throw new HTTPException(400, {
      message: "Payroll period is not in open status",
    });
  }

  // Check if the payroll period is have zero attendance
  const checkAttendance = await CheckTotalAttendanceInPayrollPeriod(
    validate.data.payroll_period_id
  );
  if (checkAttendance === 0) {
    throw new HTTPException(400, {
      message: "Payroll period has no attendance data",
    });
  }

  return {
    ...validate.data,
    start_date: checkPayrollPeriod.start_date,
    end_date: checkPayrollPeriod.end_date,
    ...requestMetadata,
  };
};
