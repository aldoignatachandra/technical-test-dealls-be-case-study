import "dotenv/config";

import { Hono } from "hono";
import { tokenMiddleware } from "./token";
import { UserMiddleware } from "../types";
import { cors } from "hono/cors";

const app = new Hono<{ Variables: UserMiddleware }>();
const origin = process.env.ORIGINS ? process.env.ORIGINS.split(",") : [""];
const corsOpt = { origin };

// cors for all path
app.use("*", cors(corsOpt));

// Basic auth specifically for login path
app.use("/auth/v1/login", async (c, next) => {
  const auth = c.req.header("Authorization");

  if (!auth || !auth.startsWith("Basic ")) {
    return c.json(
      {
        success: false,
        message:
          "Authentication required. Please provide Basic Auth credentials.",
        status: 401,
      },
      401
    );
  }

  const credentials = atob(auth.replace("Basic ", ""));
  const [username, password] = credentials.split(":");

  const validUsername = process.env.BASIC_AUTH_USERNAME;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    return c.json(
      {
        success: false,
        message: "Invalid Basic Auth credentials.",
        status: 401,
      },
      401
    );
  }

  await next();
});

app.use("*", async (c, next) => {
  const pattern = /^\/api(\/(auth\/v1\/login))?$/;
  const isNonToken = pattern.test(c.req.path);

  // Check Non Login Token For Specific PATH
  if (!isNonToken) {
    const data = await tokenMiddleware(c.req.header("authorization"));
    c.set("user", data);
  }

  await next();
});

export const Middleware = app;
