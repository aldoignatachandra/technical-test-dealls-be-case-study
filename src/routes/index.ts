import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// List Routes
import { authRoute } from './auth';

export const app = new Hono();

app.route("/auth/v1", authRoute);

app.all("*", () => {
  throw new HTTPException(404, {
    message: "route not found",
  });
});

export const Route = app;
