import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { ShowWithPassBuilder } from "../../modules/sql/auth";

export const LoginValidation = z
  .object({
    username: z.string().min(1).max(20),
    password: z.string().min(1).max(20),
  })
  .strict()
  .superRefine(async (schema, ctx) => {
    const username = schema.username.trim().toLowerCase();
    const user = await ShowWithPassBuilder(username);

    if (!user) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "username not registered",
        path: ["username"],
      });

      return z.NEVER;
    }

    const checkPassword = await bcrypt.compareSync(schema.password, user.password);

    if (!checkPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "password invalid",
        path: ["password"],
      });

      return z.NEVER;
    }
  });
