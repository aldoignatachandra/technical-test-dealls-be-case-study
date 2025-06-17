import { DateTime } from "luxon";

// Helper function to convert input (Date or string) to a Luxon DateTime instance
const toDateTime = (date: Date | string): DateTime => {
  if (typeof date === "string") {
    return DateTime.fromISO(date);
  } else {
    return DateTime.fromJSDate(date);
  }
};

export const currDate = (): DateTime => {
  return DateTime.now().setZone("Asia/Jakarta");
};

export const isoDate = (date: Date | string): any => {
  return toDateTime(date).setZone("Asia/Jakarta").toISODate();
};

export const iso = (date: Date | string): string => {
  return toDateTime(date).setZone("Asia/Jakarta").toFormat("yyyy-LL-dd HH:mm:ss");
};

export const isoUtc = (date: Date | string): string => {
  return toDateTime(date).toUTC().toFormat("yyyy-LL-dd HH:mm:ss");
};

export const standardDate = (date: Date | string): any => {
  return toDateTime(date).toISODate();
};

export const unixInt = (): number => {
  return currDate().toUnixInteger();
};

export const getWorkingDays = (startDate: string, endDate: string): number => {
  const start =
    typeof startDate === "string"
      ? DateTime.fromFormat(startDate, "dd-MM-yyyy")
      : DateTime.fromJSDate(startDate);

  const end =
    typeof endDate === "string"
      ? DateTime.fromFormat(endDate, "dd-MM-yyyy")
      : DateTime.fromJSDate(endDate);

  if (!start.isValid || !end.isValid) {
    throw new Error("Invalid date format. Use 'dd-MM-yyyy' for strings or pass a Date object.");
  }

  if (end < start) {
    throw new Error("End date must be on or after the start date.");
  }

  let workingDays = 0;
  // Loop through each day between start and end inclusive.
  for (let day = start; day <= end; day = day.plus({ days: 1 })) {
    // Luxon's weekdays: 1 = Monday, ... 7 = Sunday. Count Monday-Friday.
    if (day.weekday >= 1 && day.weekday <= 5) {
      workingDays++;
    }
  }

  return workingDays;
};
