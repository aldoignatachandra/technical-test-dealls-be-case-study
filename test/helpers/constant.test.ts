import { describe, expect, it } from "bun:test";
import {
  pgConnection,
  tableName,
  actionType,
  moduleName,
  statusPayrollPeriod,
  role,
} from "../../src/helpers/constant";

describe("Constant Helper", () => {
  describe("pgConnection", () => {
    it("should have the correct structure", () => {
      expect(pgConnection).toHaveProperty("user");
      expect(pgConnection).toHaveProperty("host");
      expect(pgConnection).toHaveProperty("database");
      expect(pgConnection).toHaveProperty("password");
      expect(pgConnection).toHaveProperty("port");
      expect(pgConnection).toHaveProperty("ssl");
      expect(pgConnection.ssl).toHaveProperty("sslmode");
      expect(pgConnection.ssl).toHaveProperty("rejectUnauthorized");
      expect(pgConnection.ssl.sslmode).toBe("require");
      expect(pgConnection.ssl.rejectUnauthorized).toBe(false);
    });
  });

  describe("tableName", () => {
    it("should have the correct table names", () => {
      expect(tableName.EMPLOYEES).toBe("employees");
      expect(tableName.PAYROLL_PERIODS).toBe("payroll_periods");
      expect(tableName.ATTENDANCE).toBe("attendance");
      expect(tableName.OVERTIME).toBe("overtime");
      expect(tableName.REIMBURSEMENTS).toBe("reimbursements");
      expect(tableName.PAYSLIPS).toBe("payslips");
      expect(tableName.AUDIT_LOGS).toBe("audit_logs");
    });
  });

  describe("actionType", () => {
    it("should have the correct action types", () => {
      expect(actionType.TOKEN_REFRESH).toBe("TOKEN_REFRESH");
      expect(actionType.LOGOUT).toBe("LOGOUT");
      expect(actionType.LOGIN).toBe("LOGIN");
      expect(actionType.CREATE).toBe("CREATE");
      expect(actionType.UPDATE).toBe("UPDATE");
      expect(actionType.DELETE).toBe("DELETE");
    });
  });

  describe("moduleName", () => {
    it("should have the correct module names", () => {
      expect(moduleName.AUTH).toBe("AUTH");
      expect(moduleName.PAYROLL_PERIOD).toBe("PAYROLL_PERIOD");
      expect(moduleName.ATTENDANCE).toBe("ATTENDANCE");
      expect(moduleName.OVERTIME).toBe("OVERTIME");
      expect(moduleName.REIMBURSEMENTS).toBe("REIMBURSEMENTS");
      expect(moduleName.PAYSLIPS).toBe("PAYSLIPS");
    });
  });

  describe("statusPayrollPeriod", () => {
    it("should have the correct status values", () => {
      expect(statusPayrollPeriod).toContain("open");
      expect(statusPayrollPeriod).toContain("closed");
      expect(statusPayrollPeriod).toContain("processed");
      expect(statusPayrollPeriod.length).toBe(3);
    });
  });

  describe("role", () => {
    it("should have the correct role values", () => {
      expect(role.ADMIN).toBe("admin");
      expect(role.EMPLOYEE).toBe("employee");
    });
  });
});