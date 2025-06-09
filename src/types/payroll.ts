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

export type CheckEmployeePayslip = {
  payroll_period_id: string;
  employee_id: string;
};

export type PayslipAttendance = {
  working_days: number;
  attended_days: number;
  attendance_rate: number;
  dates: string[];
  amount: number;
};

export type OvertimeEntry = {
  date: string;
  hours: number;
  amount: number;
  notes?: string;
};

export type PayslipOvertime = {
  entries: OvertimeEntry[];
  total_hours: number;
  multiplier: number;
  amount: number;
};

export type ReimbursementEntry = {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
};

export type PayslipReimbursements = {
  entries: ReimbursementEntry[];
  amount: number;
};

export type PayslipSummary = {
  attendance_amount: number;
  overtime_amount: number;
  reimbursement_amount: number;
  total_take_home_pay: number;
};

export type EmployeePayslip = {
  payslip_id: string | null;
  period: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  employee: {
    id: string;
    name: string;
    username: string;
  };
  salary: {
    base_salary: number;
    daily_rate: number;
    hourly_rate: number;
  };
  attendance: PayslipAttendance;
  overtime: PayslipOvertime;
  reimbursements: PayslipReimbursements;
  summary: PayslipSummary;
};
