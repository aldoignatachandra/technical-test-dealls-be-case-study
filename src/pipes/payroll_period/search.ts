import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { PayrollPeriodSearch } from "../../types";
import { SearchValidation } from "../../validations/payroll_period";

export const SearchPipe = (c: Context): PayrollPeriodSearch => {
  const validate = SearchValidation.safeParse(c.req.query());
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: "validation error",
    });
  }

  return validate.data;
};
