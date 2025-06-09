import { Hono } from "hono";
import * as controller from "../modules/controllers/payroll";
import { UserMiddleware } from "../types";
import { addRequestInfoToBody } from "../helpers/info";

const payroll = new Hono<{ Variables: UserMiddleware }>();

// Process payroll for a period
payroll.post("/process", async (c) => {
  const body = await addRequestInfoToBody(c);
  return c.json(await controller.processPayroll(body, c.get("user")), 201);
});

// Get data payslips for a payroll period
payroll.get("/payslips/:payroll_period_id", async (c) => {
  return c.json(await controller.showDetailPayslips(c));
});

// Get all summary of all employee payslips
payroll.get("/summary/:payroll_period_id", async (c) => {
  return c.json(await controller.getPayrollSummary(c), 200);
});

export const payrollRoute = payroll;
