import { z } from "zod";

export const agentFactsSchema = z.object({
  agentId: z.string().min(1),
  version: z.string().min(1),
  capabilities: z.array(z.string().min(1)),
  endpoint: z.string().url(),
  publicKey: z.string().min(1),
  issuedAt: z.string().datetime()
});

export const signedAgentFactsSchema = z.object({
  payload: agentFactsSchema,
  signature: z.string().min(1)
});

export type AgentFacts = z.infer<typeof agentFactsSchema>;
export type SignedAgentFacts = z.infer<typeof signedAgentFactsSchema>;
