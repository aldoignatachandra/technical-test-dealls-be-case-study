import { Hono } from "hono";
import * as controller from "../modules/controllers/overtime";
import { UserMiddleware } from "../types";
import { addRequestInfoToBody } from "../helpers/info";

const overtime = new Hono<{ Variables: UserMiddleware }>();

overtime.post("/submit", async (c) => {
  const body = await addRequestInfoToBody(c);
  return c.json(await controller.createOvertime(body, c.get("user")), 201);
});

export const overtimeRoute = overtime;
