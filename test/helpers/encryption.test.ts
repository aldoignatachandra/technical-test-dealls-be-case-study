import { DateTime } from "luxon";
import { jest, describe, beforeEach, expect, afterEach, it } from "bun:test";
import { JwtGenerator } from "../../src/helpers/encryption";

// Create a fixed date for consistent testing
const mockDate = DateTime.fromISO("2023-05-15T10:30:00", { zone: "Asia/Jakarta" });

// Save the original now method
const originalNow = DateTime.now;

describe("Encryption Helper Functions", () => {
  beforeEach(() => {
    // Override DateTime.now with our mock implementation
    DateTime.now = () => mockDate as any;
  });

  afterEach(() => {
    // Restore the original implementation after tests
    DateTime.now = originalNow;
  });

  describe("JwtGenerator", () => {
    it("should generate token and refresh_token", async () => {
      const testData = { userId: 1, role: "admin" };
      const result = await JwtGenerator(testData);

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refresh_token");
      expect(typeof result.token).toBe("string");
      expect(typeof result.refresh_token).toBe("string");
    });

    it("should include provided data in the token payload", async () => {
      const testData = { userId: 1, role: "admin" };
      const result = await JwtGenerator(testData);

      // Decode the token to verify payload (simplified check)
      // In a real test, you might use a JWT library to decode and verify
      const tokenParts = result.token.split('.');
      expect(tokenParts.length).toBe(3); // Header, payload, signature
      
      // Decode the base64 payload
      const decodedPayload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      
      expect(decodedPayload).toHaveProperty("userId", 1);
      expect(decodedPayload).toHaveProperty("role", "admin");
      expect(decodedPayload).toHaveProperty("iat");
      expect(decodedPayload).toHaveProperty("exp");
      expect(decodedPayload).toHaveProperty("nbf");
    });

    it("should use default expiration of 7 days for token when not specified", async () => {
      const testData = { userId: 1 };
      const result = await JwtGenerator(testData);

      const tokenParts = result.token.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      
      const iat = decodedPayload.iat;
      const exp = decodedPayload.exp;
      
      // 7 days in seconds = 7 * 24 * 60 * 60 = 604800
      expect(exp - iat).toBeCloseTo(604800, -2); // Using toBeCloseTo with negative precision for approximate comparison
    });

    it("should use default expiration of 30 days for refresh_token when not specified", async () => {
      const testData = { userId: 1 };
      const result = await JwtGenerator(testData);

      const tokenParts = result.refresh_token.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      
      const iat = decodedPayload.iat;
      const exp = decodedPayload.exp;
      
      // 30 days in seconds = 30 * 24 * 60 * 60 = 2592000
      expect(exp - iat).toBeCloseTo(2592000, -2); // Using toBeCloseTo with negative precision for approximate comparison
    });

    it("should use custom expiration when specified", async () => {
      const testData = { userId: 1 };
      const customExpDays = 14;
      const result = await JwtGenerator(testData, customExpDays);

      const tokenParts = result.token.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      
      const iat = decodedPayload.iat;
      const exp = decodedPayload.exp;
      
      // 14 days in seconds = 14 * 24 * 60 * 60 = 1209600
      expect(exp - iat).toBeCloseTo(1209600, -2); // Using toBeCloseTo with negative precision for approximate comparison
    });
  });
});