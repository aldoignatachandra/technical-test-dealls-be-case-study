import { Hono } from "hono";
import * as controller from "../modules/controllers/attendance";
import { UserMiddleware } from "../types";
import { addRequestInfoToBody } from "../helpers/info";

const attendance = new Hono<{ Variables: UserMiddleware }>();

attendance.post("/submit", async (c) => {
  const body = await addRequestInfoToBody(c);
  return c.json(await controller.createAttendance(body, c.get("user")), 201);
});

export const attendanceRoute = attendance;
