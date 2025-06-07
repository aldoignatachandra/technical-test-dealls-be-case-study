import { z } from "zod";
import { LoginValidation, LogoutValidation } from "../validations/auth";

export type AuthLogin = z.infer<typeof LoginValidation>;

export type TokenRes = { token: string; refresh_token: string };

export type AuthLogout = z.infer<typeof LogoutValidation>;
