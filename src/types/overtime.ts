import { z } from "zod";
import { CreateOvertimeValidation } from "../validations/overtime";

export type OvertimeData = {
  id: string;
  employee_id: string;
  employee_name: string;
  hours: number;
  submitted_at: Date;
  payroll_period_id: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateOvertime = z.infer<typeof CreateOvertimeValidation> & {
  payroll_period_id?: string;
};
