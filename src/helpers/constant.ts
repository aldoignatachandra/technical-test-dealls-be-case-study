import "dotenv/config";

export const pgConnection = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    sslmode: "require",
    rejectUnauthorized: false,
  },
} as const;

export const tableName = {
  EMPLOYEES: "employees",
  PAYROLL_PERIODS: "payroll_periods",
  ATTENDANCE: "attendance",
  OVERTIME: "overtime",
  REIMBURSEMENTS: "reimbursements",
  PAYSLIPS: "payslips",
  AUDIT_LOGS: "audit_logs",
} as const;

export const actionType = {
  TOKEN_REFRESH: "TOKEN_REFRESH",
  LOGOUT: "LOGOUT",
  LOGIN: "LOGIN",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export const moduleName = {
  AUTH: "AUTH",
  PAYROLL_PERIOD: "PAYROLL_PERIOD",
  ATTENDANCE: "ATTENDANCE",
  OVERTIME: "OVERTIME",
  REIMBURSEMENTS: "REIMBURSEMENTS",
  PAYSLIPS: "PAYSLIPS",
} as const;

export const statusPayrollPeriod = ["open", "closed", "processed"] as const;

export const role = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};
