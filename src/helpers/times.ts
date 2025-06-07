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
