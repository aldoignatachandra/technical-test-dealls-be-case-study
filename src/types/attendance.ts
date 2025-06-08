import { z } from "zod";
import { CreateAttendanceValidation } from "../validations/attendance";

export type AttendanceData = {
  id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  submitted_at: Date;
  payyroll_period_id: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateAttendance = z.infer<typeof CreateAttendanceValidation> & {
  payroll_period_id?: string;
};
