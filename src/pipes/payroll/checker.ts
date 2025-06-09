import { Context, HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { PayrollData } from "../../types";
import { idValidation } from "../../validations/general";
import { show as checkPayrollPeriod } from "../../modules/services/payroll_period";
import { show as checkEmployeePayslip } from "../../modules/services/payroll";

export const CheckerPipe = async (c: Context): Promise<PayrollData> => {
  const validate = await idValidation.safeParseAsync(c.req.param());
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: error._errors[0] || error.id._errors[0] || "validation error",
    });
  }

  // Check If Payroll Period Exists
  const data = await checkPayrollPeriod(validate.data);
  if (!data) {
    throw new HTTPException(404, {
      message: "payroll period not found",
    });
  }

  const user = c.get("user");

  // Check If Payslip for user login already generated or not
  const payslip = await checkEmployeePayslip({
    payroll_period_id: validate.data.id,
    employee_id: user.id,
  });
  if (!payslip) {
    throw new HTTPException(404, {
      message: "employee payslip not found",
    });
  }

  // Check if the payslip belongs to the logged-in user
  if (payslip.employee_id !== user.id) {
    throw new HTTPException(403, {
      message: "you are not allowed to access this payslip",
    });
  }

  return payslip;
};
