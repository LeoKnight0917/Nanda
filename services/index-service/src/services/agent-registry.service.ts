import type { AgentRecord, RegisterAgentBody } from "../schemas/agent.schema";

export class AgentRegistryService {
  private readonly agents = new Map<string, AgentRecord>();

  public registerAgent(payload: RegisterAgentBody): boolean {
    if (this.agents.has(payload.agentName)) {
      return false;
    }

    const record: AgentRecord = {
      agentName: payload.agentName,
      agentAddr: payload.agentAddr,
      registeredAt: new Date().toISOString()
    };

    this.agents.set(payload.agentName, record);
    return true;
  }

  public resolveAgent(agentName: string): AgentRecord | null {
    return this.agents.get(agentName) ?? null;
  }

  public getAllAgents(): AgentRecord[] {
    return Array.from(this.agents.values());
  }
}
