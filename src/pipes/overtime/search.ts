import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { OvertimeSearch } from "../../types";
import { SearchValidation } from "../../validations/overtime";

export const SearchPipe = (c: Context): OvertimeSearch => {
  const validate = SearchValidation.safeParse(c.req.query());
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: "validation error",
    });
  }

  // Only Admin Can Access All Overtime
  if (c.get("user").role !== "admin") {
    validate.data.employee_id = c.get("user").id;
  }

  return validate.data;
};
