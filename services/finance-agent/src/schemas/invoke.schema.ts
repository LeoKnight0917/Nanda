import { z } from "zod";

export const invokeBodySchema = z.object({
  ticker: z.string().min(1).max(10)
});

export type InvokeBody = z.infer<typeof invokeBodySchema>;

export interface InvokeResponse {
  ticker: string;
  price: string;
  currency: string;
}
