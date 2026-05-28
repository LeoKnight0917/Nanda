import { z } from "zod";

export const registerAgentBodySchema = z.object({
  agentName: z.string().min(1),
  agentAddr: z.string().url()
});

export const resolveAgentParamsSchema = z.object({
  agentName: z.string().min(1)
});

export const agentRecordSchema = z.object({
  agentName: z.string(),
  agentAddr: z.string().url(),
  registeredAt: z.string().datetime()
});

export type RegisterAgentBody = z.infer<typeof registerAgentBodySchema>;
export type ResolveAgentParams = z.infer<typeof resolveAgentParamsSchema>;
export type AgentRecord = z.infer<typeof agentRecordSchema>;
