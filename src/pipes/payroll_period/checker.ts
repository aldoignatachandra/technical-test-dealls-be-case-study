import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { PayrollPeriodData } from "../../types";
import { idValidation } from "../../validations/general";
import { show } from "../../modules/services/payroll_period";

export const CheckerPipe = async (c: Context): Promise<PayrollPeriodData> => {
  const validate = await idValidation.safeParseAsync(c.req.param());
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;

    console.log("Validation Error:", error);

    throw new HTTPException(422, {
      res: error,
      message: error._errors[0] || error.id._errors[0] || "validation error",
    });
  }

  const data = await show(validate.data);
  if (!data) {
    throw new HTTPException(404, {
      message: "payroll period not found",
    });
  }

  return data;
};
