import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AttendanceSearch } from "../../types";
import { SearchValidation } from "../../validations/attendance";

export const SearchPipe = (c: Context): AttendanceSearch => {
  const validate = SearchValidation.safeParse(c.req.query());
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: "validation error",
    });
  }

  // Only Admin Can Access All Attendance
  if (c.get("user").role !== "admin") {
    validate.data.employee_id = c.get("user").id;
  }

  return validate.data;
};
