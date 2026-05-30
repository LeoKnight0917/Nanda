import { z } from "zod";

export const registerAgentBodySchema = z.object({
  agentName: z.string().min(1),
  agentAddr: z.string().url(),
  privateFactsUrl: z.string().url().optional(),
  adaptiveResolverUrl: z.string().url().optional(),
  ttl: z.number().default(3600)
});

export const resolveAgentParamsSchema = z.object({
  agentName: z.string().min(1)
});

export const agentRecordSchema = z.object({
  agentName: z.string(),
  agentAddr: z.string().url(),
  privateFactsUrl: z.string().url().optional(),
  adaptiveResolverUrl: z.string().url().optional(),
  registeredAt: z.string().datetime(),
  ttl: z.number()
});

export type RegisterAgentBody = z.infer<typeof registerAgentBodySchema>;
export type ResolveAgentParams = z.infer<typeof resolveAgentParamsSchema>;
export type AgentRecord = z.infer<typeof agentRecordSchema>;
