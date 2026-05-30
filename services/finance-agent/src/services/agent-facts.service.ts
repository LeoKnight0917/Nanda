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
      id: "nanda:550e8400-e29b-41d4-a716-4466554402",
      agentId: "finance.agent",
      agentName: "urn:agent:finance:trading",
      label: "Finance Trading Agent",
      description: "Autonomous agent for stock quotes, market analysis, and portfolio management",
      version: "1.0.0",
      documentationUrl: "https://docs.example.com/agents/finance",
      jurisdiction: "USA",
      
      provider: {
        name: "NANDA Finance Service",
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
      
      capabilities: ["stock-price-query", "market-analysis", "portfolio-tracking"],
      modalities: ["text"],
      streaming: false,
      batch: true,
      
      authentication: {
        methods: ["api-key", "oauth2"],
        requiredScopes: ["finance:read", "portfolio:read"]
      },

      skills: [
        {
          id: "stock-price-query",
          description: "Real-time stock price and market data",
          inputModes: ["text"],
          outputModes: ["text"],
          supportedLanguages: ["en"],
          latencyBudgetMs: 400
        },
        {
          id: "market-analysis",
          description: "Technical and fundamental market analysis",
          inputModes: ["text"],
          outputModes: ["text"],
          maxTokens: 2000
        }
      ],

      evaluations: {
        performanceScore: 4.8,
        availability90d: "99.98%",
        lastAudited: new Date().toISOString(),
        auditorID: "Finance Auditor v1.0"
      },

      telemetry: {
        enabled: true,
        retention: "7d",
        sampling: 0.05,
        metrics: {
          latency_p95_ms: 350,
          throughput_rps: 5000,
          error_rate: 0.0005,
          availability: "99.98%"
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
