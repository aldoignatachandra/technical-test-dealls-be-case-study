import { z } from "zod";
import { CreateReimbursementValidation } from "../validations/reimbursement";

export type ReimbursementData = {
  id: string;
  employee_id: string;
  employee_name: string;
  amount: number;
  reimbursement_date: Date;
  submitted_at: Date;
  payroll_period_id: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateReimbursement = z.infer<
  typeof CreateReimbursementValidation
> & {
  payroll_period_id?: string;
};
