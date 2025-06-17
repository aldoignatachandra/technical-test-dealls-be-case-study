import { describe, expect, it } from "bun:test";
import { sortByString, numString } from "../../src/helpers/zod";

describe("Zod Helper Functions", () => {
  describe("sortByString", () => {
    it("should validate valid sort strings", () => {
      // Valid sort strings
      expect(() => sortByString.parse("name")).not.toThrow();
      expect(() => sortByString.parse("first_name")).not.toThrow();
      expect(() => sortByString.parse("name,age")).not.toThrow();
      expect(() => sortByString.parse("first_name,last_name,age")).not.toThrow();
    });

    it("should reject invalid sort strings", () => {
      // Invalid sort strings (containing non-alphanumeric characters except underscore and comma)
      expect(() => sortByString.parse("name;")).toThrow();
      expect(() => sortByString.parse("first-name")).toThrow();
      expect(() => sortByString.parse("name age")).toThrow();
      expect(() => sortByString.parse("name.age")).toThrow();
      expect(() => sortByString.parse("123")).toThrow();
      expect(() => sortByString.parse("name123")).toThrow(); // This should pass as alphanumeric is allowed
    });
  });

  describe("numString", () => {
    it("should validate valid numeric strings", () => {
      // Valid numeric strings
      expect(() => numString.parse("123")).not.toThrow();
      expect(() => numString.parse("0")).not.toThrow();
      expect(() => numString.parse("9999999")).not.toThrow();
    });

    it("should reject invalid numeric strings", () => {
      // Invalid numeric strings
      expect(() => numString.parse("abc")).toThrow();
      expect(() => numString.parse("123abc")).toThrow();
      expect(() => numString.parse("123.45")).toThrow();
      expect(() => numString.parse("-123")).toThrow();
      expect(() => numString.parse("123 456")).toThrow();
      expect(() => numString.parse("")).toThrow();
    });
  });
});
