import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateReimbursement, UserRes } from "../../types";
import { CreateReimbursementValidation } from "../../validations/reimbursement";
import { role } from "../../helpers/constant";
import { DateTime } from "luxon";
import { CheckAvailablePayrollPeriodByDate } from "../../modules/sql/payroll_period";
import { CheckAttendanceByDate } from "../../modules/sql/attendance";

export const CreateReimbursementPipe = async (
  body: HonoRequest,
  user: UserRes
): Promise<CreateReimbursement> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate = await CreateReimbursementValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;

    console.error("Validation error:", error);

    let errorMessage = "Validation error";

    // Check if there are custom errors in the validation result
    if (error?.reimbursement_date?._errors?.length > 0) {
      errorMessage = error.reimbursement_date._errors[0];
    }
    if (error?.amount?._errors?.length > 0) {
      errorMessage = error.amount._errors[0];
    }

    throw new HTTPException(422, {
      res: error,
      message: errorMessage,
    });
  }

  // Only Role 'employee' can create reimbursement
  if (user.role !== role.EMPLOYEE) {
    throw new HTTPException(403, {
      message: "You do not have permission to create reimbursement",
    });
  }

  // Check if it's not a weekend so employee need to submit attendance first
  const dateTime = DateTime.fromISO(validate.data.reimbursement_date);
  const dayOfWeek = dateTime.weekday;
  if (dayOfWeek !== 6 && dayOfWeek !== 7) {
    const checkAttendance = await CheckAttendanceByDate(validate.data.reimbursement_date, user);
    if (!checkAttendance) {
      throw new HTTPException(422, {
        message: "You must submit attendance before submitting reimbursement",
      });
    }
  }

  // Check if reimbursement_date is in between available 'open' payroll period or not
  const payrollPeriod: any = await CheckAvailablePayrollPeriodByDate(
    validate.data.reimbursement_date
  );
  if (!payrollPeriod) {
    throw new HTTPException(422, {
      message: "Reimbursement date is not within an open payroll period",
    });
  }

  return {
    ...validate.data,
    ...requestMetadata,
    payroll_period_id: payrollPeriod.id,
  };
};
