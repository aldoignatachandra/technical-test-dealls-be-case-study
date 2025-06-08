import { z } from "zod";

export const sortByString = z.string().regex(/^[a-zA-Z_,]+$/);
export const numString = z.string().regex(/^[0-9]+$/);
