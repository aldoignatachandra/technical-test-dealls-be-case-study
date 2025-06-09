import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { PayrollPeriodData } from "../../types";
import { idValidation } from "../../validations/general";
import { show } from "../../modules/services/payroll_period";

export const CheckerPipe = async (c: Context): Promise<PayrollPeriodData> => {
  const validate = await idValidation.safeParseAsync(c.req.param());
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: error._errors[0] || error.id._errors[0] || "validation error",
    });
  }

  // Check If Payroll Period Exists
  const data = await show(validate.data);
  if (!data) {
    throw new HTTPException(404, {
      message: "payroll period not found",
    });
  }

  return data;
};
