import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { UserRes } from "../types";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { ShowByIdBuilder } from "../modules/sql/auth";

export const tokenMiddleware = async (
  token: string | undefined
): Promise<UserRes> => {
  try {
    const secret = process.env.SECRET_KEY || "";

    if (!token) throw new Error("");

    const tokenStrip = token.replace("Bearer", "").trim();
    const data = await verify(tokenStrip, secret, "HS512");

    const user = await ShowByIdBuilder(data.user_id as string);
    if (!user) throw new Error("");

    return user;
  } catch (err: any) {
    let errorCode = 401;
    let errorMessage = "Unauthorized";

    if (err && err.message) {
      errorMessage = err.message;
    }

    if (err.name && err.name === "JwtTokenExpired") {
      errorCode = 403;
      errorMessage = "Token expired";
    }

    throw new HTTPException(errorCode as ContentfulStatusCode, {
      message: errorMessage,
    });
  }
};
