import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { LoginValidation } from "../../validations/auth";
import { AuthLogin } from "../../types";

export const LoginPipe = async (body: HonoRequest): Promise<AuthLogin> => {
  // Extract fields that should not be validated by Zod
  const { ip_address, user_agent, ...validationBody } = body as any;
  const requestMetadata = { ip_address, user_agent };

  const validate = await LoginValidation.safeParseAsync(validationBody);
  if (!validate.success) {
    const error: any = "error" in validate ? validate.error.format() : null;
    
    let errorMessage = "Validation error";

    // Check if there are custom errors in the username or password fields
    if (error?.username?._errors?.length > 0) {
      errorMessage = error.username._errors[0];
    } else if (error?.password?._errors?.length > 0) {
      errorMessage = error.password._errors[0];
    } else {
      errorMessage = error._errors[0] || "Invalid input";
    }

    throw new HTTPException(422, {
      res: error,
      message: errorMessage,
    });
  }

  return {
    ...validate.data,
    ...requestMetadata,
  };
};
