import { z } from "zod";

// Using z.string().uuid() is a robust way to validate that the value is a valid UUID.
export const CreatePayrollValidation = z
  .object({
    payroll_period_id: z.string().uuid("Invalid UUID format"),
  })
  .strict();
