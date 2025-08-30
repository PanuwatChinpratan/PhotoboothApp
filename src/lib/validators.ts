import { z } from "zod";

export const registerSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export const photoCreateSchema = z.object({
  image: z.string(),
  caption: z.string().optional(),
  meta: z.any().optional(),
});
