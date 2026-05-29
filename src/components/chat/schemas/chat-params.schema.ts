import { z } from "zod";

export const chatParamsSchema = z.object({
  chat_id: z.string().optional(),
  search: z.string().optional(),
});