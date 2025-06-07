import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { error } from "../helpers/logger";

export const Exception = (err: Error, c: Context) => {
  // Logger For Exception Error
  const user = c.get("user");
  error(
    `[${c.req.method}] ${c.req.path}`,
    `( ${user ? user.username : "Server"} ) Error - ${err.message}`,
    user ? user.name : "Exception"
  );

  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      message: err.message,
      data: Object.keys(err.getResponse()).length > 0 ? err.getResponse() : null,
      code: err.status,
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
    });
  }

  c.status(500);
  return c.json({
    message: err.message,
    data: null,
    code: 500,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
