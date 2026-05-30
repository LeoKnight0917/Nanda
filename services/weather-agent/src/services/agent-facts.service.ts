import {
  signedAgentFactsSchema,
  type AgentFacts,
  type SignedAgentFacts
} from "@nanda/shared-types";
import { generateKeyPair, signPayload } from "@nanda/crypto-utils";

export class AgentFactsService {
  private readonly signedFacts: SignedAgentFacts;

  constructor(endpoint: string) {
    const keyPair = generateKeyPair();
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const payload: AgentFacts = {
      id: "nanda:550e8400-e29b-41d4-a716-4466554401",
      agentId: "weather.agent",
      agentName: "urn:agent:weather:service",
      label: "Weather Query Agent",
      description: "Autonomous agent for real-time weather queries and forecasts",
      version: "1.0.0",
      documentationUrl: "https://docs.example.com/agents/weather",
      jurisdiction: "USA",
      
      provider: {
        name: "NANDA Weather Service",
        url: "https://example.com",
        did: "did:web:example.com"
      },

      // Multi-endpoint support
      endpoints: {
        static: [endpoint],
        rotating: [],
        adaptive_resolver: undefined
      },
      
      endpoint, // Legacy support
      
      capabilities: ["weather-query", "forecast", "location-search"],
      modalities: ["text"],
      streaming: false,
      batch: true,
      
      authentication: {
        methods: ["api-key"],
        requiredScopes: ["weather:read"]
      },

      skills: [
        {
          id: "weather-query",
          description: "Real-time weather information for any location",
          inputModes: ["text"],
          outputModes: ["text"],
          supportedLanguages: ["en"],
          latencyBudgetMs: 500
        },
        {
          id: "forecast",
          description: "7-day weather forecast",
          inputModes: ["text"],
          outputModes: ["text"],
          maxTokens: 1000
        }
      ],

      evaluations: {
        performanceScore: 4.7,
        availability90d: "99.95%",
        lastAudited: new Date().toISOString(),
        auditorID: "Weather Auditor v1.0"
      },

      telemetry: {
        enabled: true,
        retention: "7d",
        sampling: 0.1,
        metrics: {
          latency_p95_ms: 450,
          throughput_rps: 1000,
          error_rate: 0.001,
          availability: "99.95%"
        }
      },

      certification: {
        level: "verified",
        issuer: "NANDA",
        issuanceDate: now.toISOString(),
        expirationDate: expiryDate.toISOString(),
        revocationStatus: "active"
      },

      publicKey: keyPair.publicKey,
      issuedAt: now.toISOString(),
      ttl: 3600
    };

    const signature = signPayload(payload, keyPair.privateKey);
    this.signedFacts = signedAgentFactsSchema.parse({
      payload,
      signature
    });
  }

  public getSignedFacts(): SignedAgentFacts {
    return this.signedFacts;
  }
}
