import { TokenRes } from "../types";
import { sign } from "hono/jwt";
import { currDate } from "./times";

const secret = process.env.SECRET_KEY || "";

export const JwtGenerator = async (data: object, exp: number | null = null): Promise<TokenRes> => {
  const date = currDate();

  const payload = {
    ...data,
    iat: date.toUnixInteger(),
    exp: date.plus({ days: exp ? exp : 7 }).toUnixInteger(),
    nbf: date.toUnixInteger(),
  };

  const payloadRefresh = {
    ...payload,
    exp: date.plus({ days: exp ? exp : 30 }).toUnixInteger(),
  };

  const token = await sign(payload, secret, "HS512");
  const refresh_token = await sign(payloadRefresh, secret, "HS512");

  return {
    token,
    refresh_token,
  };
};
