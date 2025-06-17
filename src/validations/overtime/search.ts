import { z } from "zod";
import { numString, sortByString } from "../../helpers/zod";

export const SearchValidation = z
  .object({
    limit: numString.min(1).transform((val) => parseInt(val)),
    page: numString.min(1).transform((val) => parseInt(val)),
    sort_by: z.union([z.literal("").transform(() => null), sortByString.min(1)]),
    sort_type: z.union([z.literal("").transform(() => null), z.enum(["asc", "desc"])]),
    employee_id: z.union([z.literal("").transform(() => null), z.string()]).optional(),
    payroll_period_id: z.union([z.literal("").transform(() => null), z.string()]).optional(),
    overtime_date: z.union([z.literal("").transform(() => null), z.string()]).optional(),
  })
  .strict()
  .refine((schema) => (schema.sort_by && !schema.sort_type ? false : true), {
    path: ["sort_type"],
  });
