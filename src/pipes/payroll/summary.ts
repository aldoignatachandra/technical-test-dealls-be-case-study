import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { PayrollPeriodData } from "../../types";
import { idValidation } from "../../validations/general";
import { show as checkPayrollPeriod } from "../../modules/services/payroll_period";
import { role } from "../../helpers/constant";

export const SummaryPipe = async (c: Context): Promise<PayrollPeriodData> => {
  const body = { id: c.req.param("payroll_period_id") };

  const validate = await idValidation.safeParseAsync(body);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: error._errors[0] || error.id._errors[0] || "validation error",
    });
  }

  const user = c.get("user");

  // Only Role 'admin' can generate payroll
  if (user.role !== role.ADMIN) {
    throw new HTTPException(403, {
      message: "You do not have permission to generate a payroll",
    });
  }

  // Check If Payroll Period Exists
  const data = await checkPayrollPeriod(validate.data);
  if (!data) {
    throw new HTTPException(404, {
      message: "payroll period not found",
    });
  }

  // Check If Payroll Period Status is Closed or Not
  if (data.status !== "closed") {
    throw new HTTPException(400, {
      message: "payroll period must be closed before generating summary",
    });
  }

  return data;
};
