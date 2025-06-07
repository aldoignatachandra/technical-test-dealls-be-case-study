import { Hono } from "hono";
import * as controller from "../modules/controllers/auth";
import { UserMiddleware } from "../types";
import { addRequestInfoToBody } from "../helpers/info";

const auth = new Hono<{ Variables: UserMiddleware }>();

auth.post("/login", async (c) => {
  const body = await addRequestInfoToBody(c);
  return c.json(await controller.login(body));
});

auth.get("/refresh-token", async (c) => {
  return c.json(await controller.refreshToken(c.get("user")));
});

auth.post("/logout", async (c) => {
  const body = await addRequestInfoToBody(c);
  return c.json(await controller.logout(body, c));
});

export const authRoute = auth;
