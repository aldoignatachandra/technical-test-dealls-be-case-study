import { Context, HonoRequest } from "hono";
import { LoginPipe, LogoutPipe } from "../../pipes/auth";
import * as service from "../services/auth";
import { AuthLogin, GeneralResponse, UserRes } from "../../types";

export const login = async (body: HonoRequest): Promise<GeneralResponse> => {
  const validation = await LoginPipe(body);
  const data = await service.login(validation as AuthLogin);
  return { message: "success login user", data, code: 200 };
};

export const refreshToken = async (user: UserRes): Promise<GeneralResponse> => {
  const data = await service.refreshToken(user);
  return { message: "success created refresh token", data, code: 200 };
};

export const logout = async (body: HonoRequest, c: Context): Promise<GeneralResponse> => {
  const validation = await LogoutPipe(body, c);
  await service.logout(validation);
  return { message: "success logout user", data: null, code: 200 };
};
