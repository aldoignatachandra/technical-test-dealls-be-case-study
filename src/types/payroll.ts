import { z } from "zod";
import { CreatePayrollValidation } from "../validations/payroll";

export type PayrollData = {
  id: string;
  employee_id: string;
  employee_name: string;
  payroll_period_id: string;
  base_salary: number;
  attendance_count: number;
  attendance_amount: number;
  overtime_count: number;
  overtime_amount: number;
  reimbursement_amount: number;
  total_amount: number;
  total_take_home: number;
  generated_at: Date;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
};

export type CreatePayroll = z.infer<typeof CreatePayrollValidation> & {
  start_date: string;
  end_date: string;
};

export type CreatePayrollResponse = {
  payroll_period_id: string;
  processed_at: Date;
  payslips_count: number;
  payslips: CreatePayslipResponse[];
};

export type CreatePayslipResponse = {
  id: string;
  employee_id: string;
  total_amount: number;
};
