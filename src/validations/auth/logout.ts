import { z } from "zod";

export const LogoutValidation = z
  .object({
    user_id: z.string().uuid(),
  })
  .strict();
