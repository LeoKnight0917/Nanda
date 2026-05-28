import { ZodError } from "zod";
import {
  agentFactsSchema,
  signedAgentFactsSchema,
  type AgentFacts,
  type SignedAgentFacts
} from "./schemas/agent-facts.schema";

export function validateAgentFacts(input: unknown): AgentFacts {
  return agentFactsSchema.parse(input);
}

export function validateSignedAgentFacts(input: unknown): SignedAgentFacts {
  return signedAgentFactsSchema.parse(input);
}

export function isAgentFacts(input: unknown): input is AgentFacts {
  return agentFactsSchema.safeParse(input).success;
}

export function isSignedAgentFacts(input: unknown): input is SignedAgentFacts {
  return signedAgentFactsSchema.safeParse(input).success;
}

export { ZodError };
