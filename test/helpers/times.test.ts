import { DateTime } from "luxon";
import { describe, beforeEach, expect, afterEach, it } from "bun:test";
import {
  currDate,
  isoDate,
  iso,
  isoUtc,
  standardDate,
  unixInt,
  getWorkingDays,
} from "../../src/helpers/times";

// Create a fixed date for consistent testing
const mockNow = DateTime.fromISO("2023-05-15T10:30:00", { zone: "UTC" });

// Save the original now method
const originalNow = DateTime.now;

// Setup and teardown for each test
describe("Times Helper Functions", () => {
  beforeEach(() => {
    // Override DateTime.now with our mock implementation
    DateTime.now = () => mockNow as any;
  });

  afterEach(() => {
    // Restore the original implementation after tests
    DateTime.now = originalNow;
  });

  describe("currDate", () => {
    it("should return current date in Jakarta timezone", () => {
      const result = currDate();
      expect(result.zoneName).toBe("Asia/Jakarta");
      expect(result.toISO()).toContain("2023-05-15");
    });
  });

  describe("isoDate", () => {
    it("should format date as ISO date string in Jakarta timezone", () => {
      const testDate = new Date("2023-05-15T10:30:00Z");
      const result = isoDate(testDate);
      expect(result).toBe("2023-05-15");
    });

    it("should handle string date input", () => {
      const result = isoDate("2023-05-15T10:30:00Z");
      expect(result).toBe("2023-05-15");
    });
  });

  describe("iso", () => {
    it("should format date in yyyy-LL-dd HH:mm:ss format in Jakarta timezone", () => {
      const testDate = new Date("2023-05-15T10:30:00Z");
      const result = iso(testDate);
      // Adjust expected result based on Jakarta timezone (UTC+7)
      expect(result).toMatch(/^2023-05-15 17:30:00$/);
    });
  });

  describe("isoUtc", () => {
    it("should format date in yyyy-LL-dd HH:mm:ss format in UTC", () => {
      const testDate = new Date("2023-05-15T10:30:00Z");
      const result = isoUtc(testDate);
      expect(result).toBe("2023-05-15 10:30:00");
    });
  });

  describe("standardDate", () => {
    it("should return date in ISO format", () => {
      const testDate = new Date("2023-05-15T10:30:00Z");
      const result = standardDate(testDate);
      expect(result).toBe("2023-05-15");
    });
  });

  describe("unixInt", () => {
    it("should return current time as Unix timestamp", () => {
      // May 15, 2023 10:30:00 UTC converted to Unix timestamp
      const expected = mockNow.setZone("Asia/Jakarta").toUnixInteger();
      const result = unixInt();
      expect(result).toBe(expected);
    });
  });

  describe("getWorkingDays", () => {
    it("should calculate working days between two dates", () => {
      // This test will depend on the actual implementation of getWorkingDays
      // Assuming it counts weekdays (Monday to Friday)
      const result = getWorkingDays("01-05-2023", "05-05-2023");
      expect(result).toBe(5); // 5 weekdays in this range
    });

    it("should throw error for invalid date format", () => {
      expect(() => getWorkingDays("invalid-date", "05-05-2023")).toThrow();
    });
  });
});
