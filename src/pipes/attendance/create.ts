import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateAttendance, UserRes } from "../../types";
import { CreateAttendanceValidation } from "../../validations/attendance";
import { role } from "../../helpers/constant";
import { DateTime } from "luxon";
import { CheckAvailablePayrollPeriodByDate } from "../../modules/sql/payroll_period";

export const CreateAttendancePipe = async (
  body: HonoRequest,
  user: UserRes
): Promise<CreateAttendance> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate = await CreateAttendanceValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;

    let errorMessage = "Validation error";

    // Check if there are custom errors in the validation result
    if (error?.attendance_date?._errors?.length > 0) {
      errorMessage = error.attendance_date._errors[0];
    }

    throw new HTTPException(422, {
      res: error,
      message: errorMessage,
    });
  }

  // Only Role 'employee' can create attendance
  if (user.role !== role.EMPLOYEE) {
    throw new HTTPException(403, {
      message: "You do not have permission to create attendance",
    });
  }

  // Check if it's a weekend
  const dateTime = DateTime.fromISO(validate.data.attendance_date);
  const dayOfWeek = dateTime.weekday;
  if (dayOfWeek === 6 || dayOfWeek === 7) {
    // 6 = Saturday, 7 = Sunday
    throw new HTTPException(422, {
      message: "Cannot submit attendance on weekends",
    });
  }

  // Check if attendance_date is in between available 'open' payroll period or not
  const payrollPeriod: any = await CheckAvailablePayrollPeriodByDate(validate.data.attendance_date);
  if (!payrollPeriod) {
    throw new HTTPException(422, {
      message: "Attendance date is not within an open payroll period",
    });
  }

  return {
    ...validate.data,
    ...requestMetadata,
    payroll_period_id: payrollPeriod.id,
  };
};
