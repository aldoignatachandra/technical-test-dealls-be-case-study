import { JwtGenerator } from "../../helpers/encryption";
import { TokenRes, AuthLogin, UserRes, AuthLogout } from "../../types";
import {
  DeleteTokenBuilder,
  ShowByUsernameBuilder,
  ShowByIdBuilder,
  UpdateTokenBuilder,
} from "../sql/auth";
import { log } from "../../helpers/logger";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";

export const login = async (body: AuthLogin): Promise<TokenRes> => {
  const ctx = "auth-login";
  const user = await ShowByUsernameBuilder(body.username.trim().toLowerCase());
  const token = await JwtGenerator({ user_id: user.id });
  const bodyExt = body as AuthLogin & { ip?: string; userAgent?: string };

  // Update user token in the database
  await UpdateTokenBuilder(user.id, token.token);

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.EMPLOYEES,
    record_id: user.id,
    action: actionType.LOGIN,
    module: moduleName.AUTH,
    ip_address: bodyExt.ip,
    user_agent: bodyExt.userAgent,
    additional_data: { token: token.token },
  });

  log(ctx, `Login success - ${user.username}`, `${user.name}`);
  return token;
};

export const refreshToken = async (user: UserRes): Promise<TokenRes> => {
  return await JwtGenerator({ user_id: user.id });
};

export const logout = async (body: AuthLogout): Promise<void> => {
  const ctx = "auth-logout";
  const user = await ShowByIdBuilder(body.user_id);
  const bodyExt = body as AuthLogout & { ip?: string; userAgent?: string };

  // Delete user token in the database
  await DeleteTokenBuilder(body.user_id);

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.EMPLOYEES,
    record_id: user.id,
    action: actionType.LOGOUT,
    module: moduleName.AUTH,
    ip_address: bodyExt.ip,
    user_agent: bodyExt.userAgent,
    additional_data: { lastToken: user.token },
  });

  log(ctx, `Logout success - ${user.username}`, `${user.name}`);
};
