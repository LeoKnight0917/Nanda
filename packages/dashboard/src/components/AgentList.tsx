import React, { useEffect, useState } from "react";
import axios from "axios";

type Agent = {
  agentName: string;
  agentAddr: string;
  registeredAt: string;
};

export default function AgentList({ apiBase, onSelect, selected }: { apiBase: string; onSelect: (name: string) => void; selected: string | null; }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get(`${apiBase}/agents`).then((res) => {
      if (mounted) setAgents(res.data || []);
    }).catch(() => {
      if (mounted) setAgents([]);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [apiBase]);

  return (
    <div>
      <h2 className="font-medium mb-3">Registered agents</h2>
      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {!loading && agents.length === 0 && <div className="text-sm text-gray-500">No agents</div>}
      <ul>
        {agents.map((a) => (
          <li key={a.agentName} className={`p-2 rounded hover:bg-gray-50 cursor-pointer ${selected===a.agentName? 'bg-gray-100':''}`} onClick={() => onSelect(a.agentName)}>
            <div className="font-semibold">{a.agentName}</div>
            <div className="text-xs text-gray-500">{a.agentAddr}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
