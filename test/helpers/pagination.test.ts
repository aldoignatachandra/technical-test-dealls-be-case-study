import { describe, expect, it } from "bun:test";
import { PaginationBuilder } from "../../src/helpers/pagination";

describe("Pagination Helper Functions", () => {
  describe("PaginationBuilder", () => {
    it("should calculate pagination correctly with data", () => {
      // Test case: Page 1 with 10 items per page, total 25 items, current page has 10 items
      const params = { limit: 10, page: 1 };
      const total = 25;
      const total_data = 10;

      const result = PaginationBuilder(params, total, total_data);

      expect(result.total).toBe(25);
      expect(result.per_page).toBe(10);
      expect(result.current_page).toBe(1);
      expect(result.last_page).toBe(3); // Ceil(25/10) = 3
      expect(result.from).toBe(1); // First item on page 1
      expect(result.to).toBe(10); // Last item on page 1
    });

    it("should calculate pagination correctly for middle page", () => {
      // Test case: Page 2 with 10 items per page, total 25 items, current page has 10 items
      const params = { limit: 10, page: 2 };
      const total = 25;
      const total_data = 10;

      const result = PaginationBuilder(params, total, total_data);

      expect(result.total).toBe(25);
      expect(result.per_page).toBe(10);
      expect(result.current_page).toBe(2);
      expect(result.last_page).toBe(3); // Ceil(25/10) = 3
      expect(result.from).toBe(11); // First item on page 2
      expect(result.to).toBe(20); // Last item on page 2
    });

    it("should calculate pagination correctly for last page with fewer items", () => {
      // Test case: Page 3 with 10 items per page, total 25 items, current page has 5 items
      const params = { limit: 10, page: 3 };
      const total = 25;
      const total_data = 5;

      const result = PaginationBuilder(params, total, total_data);

      expect(result.total).toBe(25);
      expect(result.per_page).toBe(10);
      expect(result.current_page).toBe(3);
      expect(result.last_page).toBe(3); // Ceil(25/10) = 3
      expect(result.from).toBe(21); // First item on page 3
      expect(result.to).toBe(25); // Last item on page 3 (only 5 items)
    });

    it("should handle empty result set", () => {
      // Test case: No data
      const params = { limit: 10, page: 1 };
      const total = 0;
      const total_data = 0;

      const result = PaginationBuilder(params, total, total_data);

      expect(result.total).toBe(0);
      expect(result.per_page).toBe(10);
      expect(result.current_page).toBe(1);
      expect(result.last_page).toBe(1); // At least 1 page even with no data
      expect(result.from).toBe(0); // No starting item
      expect(result.to).toBe(0); // No ending item
    });

    it("should handle string inputs for limit and page", () => {
      // Test case: String inputs (which should be parsed to integers)
      const params = { limit: "10" as any, page: "2" as any };
      const total = 25;
      const total_data = 10;

      const result = PaginationBuilder(params, total, total_data);

      expect(result.per_page).toBe(10);
      expect(result.current_page).toBe(2);
      expect(result.from).toBe(11);
      expect(result.to).toBe(20);
    });
  });
});
