import { Context, HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { LogoutValidation } from "../../validations/auth";
import { AuthLogout } from "../../types";
import { ShowByIdBuilder } from "../../modules/sql/auth";

export const LogoutPipe = async (
  body: HonoRequest,
  c: Context
): Promise<AuthLogout> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate = await LogoutValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    throw new HTTPException(422, {
      res: error,
      message: error._errors[0] || "Invalid input",
    });
  }

  // Check if user is already exist in database or not
  const user = await ShowByIdBuilder(validate.data.user_id);
  if (!user) {
    throw new HTTPException(404, {
      message: "User not found",
    });
  }

  const userCtx = c.get("user");

  // Check if existing user token is valid or not
  if (user.token !== userCtx.token || user.id !== userCtx.id) {
    throw new HTTPException(401, {
      message: "Token is not valid",
    });
  }

  return {
    ...validate.data,
    ...requestMetadata,
  };
};
