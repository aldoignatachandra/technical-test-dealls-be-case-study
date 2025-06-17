import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AttendanceData } from "../../types";
import { idValidation } from "../../validations/general";
import { show } from "../../modules/services/attendance";

export const CheckerPipe = async (c: Context): Promise<AttendanceData> => {
  const body = { id: c.req.param("attendance_id") };

  const validate = await idValidation.safeParseAsync(body);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: error._errors[0] || error.id._errors[0] || "validation error",
    });
  }

  // Check If Attendance Exists
  const data = await show(validate.data);
  if (!data) {
    throw new HTTPException(404, {
      message: "attendance not found",
    });
  }

  // Check If User Is Not Admin, Only Can Acces Their Own Attendance
  if (data.employee_id !== c.get("user").id && c.get("user").role !== "admin") {
    throw new HTTPException(403, {
      message: "forbidden access",
    });
  }

  return data;
};
