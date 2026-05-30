import { z } from "zod";

// Extended AgentFacts schema aligned with NANDA paper
export const skillSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
  inputModes: z.array(z.string()),
  outputModes: z.array(z.string()),
  supportedLanguages: z.array(z.string()).optional(),
  maxTokens: z.number().optional(),
  latencyBudgetMs: z.number().optional()
});

export const endpointListSchema = z.object({
  static: z.array(z.string().url()).optional(),
  rotating: z.array(z.string().url()).optional(),
  adaptive_resolver: z.object({
    url: z.string().url(),
    policies: z.array(z.string())
  }).optional()
});

export const evaluationsSchema = z.object({
  performanceScore: z.number().optional(),
  availability90d: z.string().optional(),
  lastAudited: z.string().datetime().optional(),
  auditTrail: z.string().optional(),
  auditorID: z.string().optional()
});

export const telemetrySchema = z.object({
  enabled: z.boolean().default(false),
  retention: z.string().optional(),
  sampling: z.number().optional(),
  metrics: z.object({
    latency_p95_ms: z.number().optional(),
    throughput_rps: z.number().optional(),
    error_rate: z.number().optional(),
    availability: z.string().optional()
  }).optional()
});

export const certificationSchema = z.object({
  level: z.enum(["verified", "unverified", "revoked"]).default("unverified"),
  issuer: z.string().min(1),
  issuanceDate: z.string().datetime(),
  expirationDate: z.string().datetime(),
  revocationStatus: z.enum(["active", "revoked"]).default("active")
});

export const agentFactsSchema = z.object({
  // Identity & Basic Information
  id: z.string().min(1),
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  label: z.string().optional(),
  description: z.string().optional(),
  version: z.string().min(1),
  documentationUrl: z.string().url().optional(),
  jurisdiction: z.string().optional(),
  
  // Provider Information
  provider: z.object({
    name: z.string(),
    url: z.string().url(),
    did: z.string().optional()
  }).optional(),

  // Network Endpoints (multi-endpoint support)
  endpoints: endpointListSchema.optional(),
  
  // Legacy single endpoint for backward compatibility
  endpoint: z.string().url().optional(),

  // Technical Capabilities
  capabilities: z.array(z.string().min(1)),
  modalities: z.array(z.string()).optional(),
  streaming: z.boolean().default(false),
  batch: z.boolean().default(false),
  authentication: z.object({
    methods: z.array(z.string()),
    requiredScopes: z.array(z.string()).optional()
  }).optional(),

  // Functional Skills
  skills: z.array(skillSchema).optional(),

  // Quality Metrics
  evaluations: evaluationsSchema.optional(),

  // Observability & Monitoring
  telemetry: telemetrySchema.optional(),

  // Trust & Verification
  certification: certificationSchema,

  // Privacy Paths (NANDA additions)
  primaryFactsUrl: z.string().url().optional(),
  privateFactsUrl: z.string().url().optional(),
  adaptiveResolverUrl: z.string().url().optional(),

  // Cryptographic Trust
  publicKey: z.string().min(1),
  issuedAt: z.string().datetime(),
  
  // TTL for caching
  ttl: z.number().default(3600)
});

export const agentAddrSchema = z.object({
  agent_id: z.string().min(1),
  agent_name: z.string().min(1),
  primary_facts_url: z.string().url(),
  private_facts_url: z.string().url().optional(),
  adaptive_resolver_url: z.string().url().optional(),
  ttl: z.number().default(3600),
  signature: z.string().min(1),
  signed_at: z.string().datetime()
});

export const signedAgentFactsSchema = z.object({
  payload: agentFactsSchema,
  signature: z.string().min(1)
});

export type Skill = z.infer<typeof skillSchema>;
export type EndpointList = z.infer<typeof endpointListSchema>;
export type Evaluations = z.infer<typeof evaluationsSchema>;
export type Telemetry = z.infer<typeof telemetrySchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type AgentFacts = z.infer<typeof agentFactsSchema>;
export type AgentAddr = z.infer<typeof agentAddrSchema>;
export type SignedAgentFacts = z.infer<typeof signedAgentFactsSchema>;
