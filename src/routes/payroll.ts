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

// // Get all payslips for a payroll period
// payroll.get("/payslips", async (c) => {
//   const body = await addRequestInfoToBody(c);
//   return c.json(await controller.getPayslipsByPeriod(body, c.get("user")));
// });

// // Get all summary of all employee payslips
// payroll.get("/summary", async (c) => {
//   const body = await addRequestInfoToBody(c);
//   return c.json(await controller.getPayrollSummary(body, c.get("user")), 200);
// });

export const payrollRoute = payroll;
