export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export {
  agentFactsSchema,
  signedAgentFactsSchema,
  agentAddrSchema,
  skillSchema,
  endpointListSchema,
  evaluationsSchema,
  telemetrySchema,
  certificationSchema,
  type AgentFacts,
  type SignedAgentFacts,
  type AgentAddr,
  type Skill,
  type EndpointList,
  type Evaluations,
  type Telemetry,
  type Certification
} from "./schemas/agent-facts.schema";

export {
  validateAgentFacts,
  validateSignedAgentFacts,
  isAgentFacts,
  isSignedAgentFacts,
  ZodError
} from "./validation";
