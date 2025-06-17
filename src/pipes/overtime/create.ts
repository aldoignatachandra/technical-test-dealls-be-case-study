import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateOvertime, UserRes } from "../../types";
import { CreateOvertimeValidation } from "../../validations/overtime";
import { role } from "../../helpers/constant";
import { DateTime } from "luxon";
import { CheckAvailablePayrollPeriodByDate } from "../../modules/sql/payroll_period";
import { CheckAttendanceByDate } from "../../modules/sql/attendance";
import { CountOvertimeByDate } from "../../modules/sql/overtime";

export const CreateOvertimePipe = async (
  body: HonoRequest,
  user: UserRes
): Promise<CreateOvertime> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate = await CreateOvertimeValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;

    console.error("Validation error:", error);

    let errorMessage = "Validation error";

    // Check if there are custom errors in the validation result
    if (error?.overtime_date?._errors?.length > 0) {
      errorMessage = error.overtime_date._errors[0];
    }
    if (error?.hours?._errors?.length > 0) {
      errorMessage = error.hours._errors[0];
    }

    throw new HTTPException(422, {
      res: error,
      message: errorMessage,
    });
  }

  // Only Role 'employee' can create overtime
  if (user.role !== role.EMPLOYEE) {
    throw new HTTPException(403, {
      message: "You do not have permission to create overtime",
    });
  }

  // Check if it's not a weekend so employee need to submit attendance first
  const dateTime = DateTime.fromISO(validate.data.overtime_date);
  const dayOfWeek = dateTime.weekday;
  if (dayOfWeek !== 6 && dayOfWeek !== 7) {
    const checkAttendance = await CheckAttendanceByDate(validate.data.overtime_date, user);
    if (!checkAttendance) {
      throw new HTTPException(422, {
        message: "You must submit attendance before submitting overtime",
      });
    }
  }

  // Check if overtime_date is in between available 'open' payroll period or not
  const payrollPeriod: any = await CheckAvailablePayrollPeriodByDate(validate.data.overtime_date);
  if (!payrollPeriod) {
    throw new HTTPException(422, {
      message: "Overtime date is not within an open payroll period",
    });
  }

  // Check if the overtime cant input accumulation 3 hours in a day
  const checkOvertime = await CountOvertimeByDate(validate.data.overtime_date, user);
  if (checkOvertime + validate.data.hours > 3) {
    throw new HTTPException(422, {
      message: "You cannot submit more than 3 hours of overtime in a day",
    });
  }

  return {
    ...validate.data,
    ...requestMetadata,
    payroll_period_id: payrollPeriod.id,
  };
};
