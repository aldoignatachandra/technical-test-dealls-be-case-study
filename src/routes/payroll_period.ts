import { Hono } from "hono";
import * as controller from "../modules/controllers/payroll_period";
import { UserMiddleware } from "../types";
import { addRequestInfoToBody } from "../helpers/info";

const payrollPeriod = new Hono<{ Variables: UserMiddleware }>();

payrollPeriod.post("/", async (c) => {
  const body = await addRequestInfoToBody(c);
  return c.json(await controller.createPayrollPeriod(body, c.get("user")), 201);
});

export const payrollPeriodRoute = payrollPeriod;
