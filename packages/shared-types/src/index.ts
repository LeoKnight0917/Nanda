export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export {
  agentFactsSchema,
  signedAgentFactsSchema,
  type AgentFacts,
  type SignedAgentFacts
} from "./schemas/agent-facts.schema";

export {
  validateAgentFacts,
  validateSignedAgentFacts,
  isAgentFacts,
  isSignedAgentFacts,
  ZodError
} from "./validation";
