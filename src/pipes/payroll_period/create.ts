import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreatePayrollPeriod, UserRes } from "../../types";
import { CreatePayrollPeriodValidation } from "../../validations/payroll_period";
import { role } from "../../helpers/constant";
import { CheckOverlappingPeriods } from "../../modules/sql/payroll_period";

export const CreatePayrollPeriodPipe = async (
  body: HonoRequest,
  user: UserRes
): Promise<CreatePayrollPeriod> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate =
    await CreatePayrollPeriodValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;

    let errorMessage = "Validation error";

    // Check if there are custom errors in the validation result
    if (error?.start_date?._errors?.length > 0) {
      errorMessage = error.start_date._errors[0];
    } else if (error?.end_date?._errors?.length > 0) {
      errorMessage = error.end_date._errors[0];
    } else if (error?.status?._errors?.length > 0) {
      errorMessage = error.status._errors[0];
    } else {
      errorMessage = error._errors[0] || "Invalid input";
    }

    throw new HTTPException(422, {
      res: error,
      message: errorMessage,
    });
  }

  // Only Role 'admin' can create payroll period
  if (user.role !== role.ADMIN) {
    throw new HTTPException(403, {
      message: "You do not have permission to create a payroll period",
    });
  }

  // Check Overlapping Payroll Periods
  const startDate = validate.data.start_date;
  const endDate = validate.data.end_date;
  const overlappingPeriod = await CheckOverlappingPeriods(startDate, endDate);
  if (overlappingPeriod) {
    throw new HTTPException(422, {
      message: "Payroll period overlaps with existing periods",
    });
  }

  return {
    ...validate.data,
    ...requestMetadata,
  };
};
