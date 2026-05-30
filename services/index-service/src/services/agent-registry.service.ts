import type { AgentRecord, RegisterAgentBody } from "../schemas/agent.schema";
import type { AgentAddr } from "@nanda/shared-types";
import { generateKeyPair, signPayload } from "@nanda/crypto-utils";

export class AgentRegistryService {
  private readonly agents = new Map<string, AgentRecord>();
  private readonly indexKeyPair = generateKeyPair();

  public registerAgent(payload: RegisterAgentBody): boolean {
    if (this.agents.has(payload.agentName)) {
      return false;
    }

    const record: AgentRecord = {
      agentName: payload.agentName,
      agentAddr: payload.agentAddr,
      privateFactsUrl: payload.privateFactsUrl,
      adaptiveResolverUrl: payload.adaptiveResolverUrl,
      registeredAt: new Date().toISOString(),
      ttl: payload.ttl ?? 3600
    };

    this.agents.set(payload.agentName, record);
    return true;
  }

  public resolveAgent(agentName: string): AgentAddr | null {
    const record = this.agents.get(agentName);
    if (!record) {
      return null;
    }

    // Build AgentAddr payload, filtering out undefined values
    const agentAddrPayload: Record<string, any> = {
      agent_id: `nanda:${agentName}`,
      agent_name: agentName,
      primary_facts_url: record.agentAddr,
      ttl: record.ttl,
      signed_at: new Date().toISOString()
    };

    // Add optional fields only if defined
    if (record.privateFactsUrl) {
      agentAddrPayload.private_facts_url = record.privateFactsUrl;
    }
    if (record.adaptiveResolverUrl) {
      agentAddrPayload.adaptive_resolver_url = record.adaptiveResolverUrl;
    }

    // Sign the AgentAddr
    const signature = signPayload(agentAddrPayload, this.indexKeyPair.privateKey);

    const agentAddr: AgentAddr = {
      agent_id: agentAddrPayload.agent_id,
      agent_name: agentAddrPayload.agent_name,
      primary_facts_url: agentAddrPayload.primary_facts_url,
      private_facts_url: agentAddrPayload.private_facts_url,
      adaptive_resolver_url: agentAddrPayload.adaptive_resolver_url,
      ttl: agentAddrPayload.ttl,
      signed_at: agentAddrPayload.signed_at,
      signature
    };

    return agentAddr;
  }

  public getAllAgents(): AgentAddr[] {
    return Array.from(this.agents.values()).map(record => {
      const agentAddrPayload: Record<string, any> = {
        agent_id: `nanda:${record.agentName}`,
        agent_name: record.agentName,
        primary_facts_url: record.agentAddr,
        ttl: record.ttl,
        signed_at: new Date().toISOString()
      };

      if (record.privateFactsUrl) {
        agentAddrPayload.private_facts_url = record.privateFactsUrl;
      }
      if (record.adaptiveResolverUrl) {
        agentAddrPayload.adaptive_resolver_url = record.adaptiveResolverUrl;
      }

      const signature = signPayload(agentAddrPayload, this.indexKeyPair.privateKey);

      return {
        agent_id: agentAddrPayload.agent_id,
        agent_name: agentAddrPayload.agent_name,
        primary_facts_url: agentAddrPayload.primary_facts_url,
        private_facts_url: agentAddrPayload.private_facts_url,
        adaptive_resolver_url: agentAddrPayload.adaptive_resolver_url,
        ttl: agentAddrPayload.ttl,
        signed_at: agentAddrPayload.signed_at,
        signature
      };
    });
  }

  public getIndexPublicKey(): string {
    return this.indexKeyPair.publicKey;
  }
}
