import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// List Routes
import { authRoute } from "./auth";
import { payrollPeriodRoute } from "./payroll_period";
import { attendanceRoute } from "./attendance";
import { overtimeRoute } from "./overtime";
import { reimbursementRoute } from "./reimbursement";

export const app = new Hono();

app.route("/auth/v1", authRoute);
app.route("/payroll-period/v1", payrollPeriodRoute);
app.route("/attendance/v1", attendanceRoute);
app.route("/overtime/v1", overtimeRoute);
app.route("/reimbursement/v1", reimbursementRoute);

app.all("*", () => {
  throw new HTTPException(404, {
    message: "route not found",
  });
});

export const Route = app;
