import { z } from "zod";
import { statusPayrollPeriod } from "../helpers/constant";
import { CreatePayrollPeriodValidation } from "../validations/payroll_period";
import { SearchValidation } from "../validations/payroll_period";

export type PayrollStatus = (typeof statusPayrollPeriod)[number];

export type PayrollPeriodData = {
  id: string;
  start_date: string;
  end_date: string;
  status: PayrollStatus;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  processed_at?: Date | null;
  processed_by?: string | null;
};

export type CreatePayrollPeriod = z.infer<typeof CreatePayrollPeriodValidation>;

export type PayrollPeriodSearch = z.infer<typeof SearchValidation>;
