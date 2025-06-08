import { z } from "zod";

export const idValidation = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
