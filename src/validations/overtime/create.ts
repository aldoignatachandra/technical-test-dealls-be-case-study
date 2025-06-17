import { z } from "zod";
import { DateTime } from "luxon";
import { isoDate } from "../../helpers/times";

/**
 * Parse a date string in format DD-MM-YYYY to a Luxon DateTime object
 */
const parseDDMMYYYY = (dateString: string): DateTime => {
  // Split the date string by "-" to get [day, month, year]
  const [day, month, year] = dateString.split("-").map(Number);

  // Create a Luxon DateTime object
  const date = DateTime.fromObject({ day, month, year }, { zone: "Asia/Jakarta" });

  // Check if the date is valid
  if (!date.isValid) {
    throw new Error(date.invalidExplanation || "Invalid date format");
  }

  return date;
};

export const CreateOvertimeValidation = z
  .object({
    overtime_date: z
      .string()
      .regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in format DD-MM-YYYY")
      .transform((date) => {
        try {
          // Parse the input string to a DateTime object
          const dateTime = parseDDMMYYYY(date);
          // Convert to ISO date string for consistent format
          return isoDate(dateTime.toJSDate());
        } catch (error) {
          // Return the original string to trigger the refinement validation
          return date;
        }
      })
      .refine(
        (date) => {
          try {
            // Attempt to parse as ISO date
            return DateTime.fromISO(date).isValid;
          } catch {
            return false;
          }
        },
        {
          message: "Invalid start date format. Use DD-MM-YYYY",
        }
      ),
    hours: z
      .number()
      .min(1, "Overtime hours must be at least 1 hour")
      .max(3, "Overtime hours cannot exceed 3 hours"),
  })
  .strict()
  .superRefine(async (schema, ctx) => {
    // Convert ISO strings to DateTime objects for comparison
    const overtimeDate = DateTime.fromISO(schema.overtime_date);

    if (!overtimeDate.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid overtime date",
        path: ["overtime_date"],
      });

      return z.NEVER;
    }
  });
