import "dotenv/config";

import { Hono } from "hono";
import { Route } from "./routes";
import { Exception } from "./helpers/exception";
import { Middleware } from "./middleware";
import { info } from "./helpers/logger";

const port = parseInt(process.env.PORT || "3001");
const app = new Hono();

const ctx = "app-listen";

// Base Path
app.basePath("/api").route("/", Middleware).route("/", Route);

// Error Handling
app.onError((err, c) => Exception(err, c));

// Logger Server Start
info(ctx, `server started, listening at port ( ${port} )`, "initate application");

export default {
  fetch: app.fetch,
  port,
};
