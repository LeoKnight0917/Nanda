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
    const payload: AgentFacts = {
      agentId: "finance.agent",
      version: "1.0",
      capabilities: ["stock-price-query"],
      endpoint,
      publicKey: keyPair.publicKey,
      issuedAt: new Date().toISOString()
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
