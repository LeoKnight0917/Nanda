import { z } from "zod";

export const invokeBodySchema = z.object({
  query: z.string().min(1)
});

export type InvokeBody = z.infer<typeof invokeBodySchema>;

export interface InvokeResponse {
  location: string;
  temperature: string;
  condition: string;
}
