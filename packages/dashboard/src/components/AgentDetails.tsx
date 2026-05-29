import React, { useEffect, useState } from "react";
import axios from "axios";

type SignedFacts = {
  payload: any;
  signature: string;
};

export default function AgentDetails({ apiBase, agentName }: { apiBase: string; agentName: string | null; }) {
  const [resolve, setResolve] = useState<any | null>(null);
  const [facts, setFacts] = useState<SignedFacts | null>(null);
  const [verify, setVerify] = useState<boolean | null>(null);
  const [invokeResp, setInvokeResp] = useState<any | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setResolve(null); setFacts(null); setVerify(null); setInvokeResp(null);
    if (!agentName) return;

    (async () => {
      try {
        const r = await axios.get(`${apiBase}/resolve/${encodeURIComponent(agentName)}`);
        setResolve(r.data);

        // fetch facts from agent
        // agentAddr may already point to /facts; use it directly if so, otherwise append /facts
        const maybeFactsUrl = r.data.agentAddr.replace(/\/$/, "");
        const factsUrl = maybeFactsUrl.endsWith("/facts") ? maybeFactsUrl : `${maybeFactsUrl}/facts`;
        const f = await axios.get(factsUrl);
        setFacts(f.data);

        // verify via index-service
        const v = await axios.post(`${apiBase}/verify-facts`, f.data);
        setVerify(Boolean(v.data.valid));
      } catch (err) {
        // ignore, show placeholders
      }
    })();
  }, [apiBase, agentName]);

  const handleInvoke = async () => {
    if (!resolve) return;
    try {
      // Use the endpoint declared in AgentFacts payload (more reliable)
      const endpoint = facts?.payload?.endpoint ?? resolve.agentAddr.replace(/\/$/, "") + "/invoke";
      const url = endpoint.replace(/\/$/, "") ;
      const body = { query };
      const r = await axios.post(url, body);
      setInvokeResp(r.data);
    } catch (err:any) {
      setInvokeResp({ error: err?.message ?? String(err) });
    }
  };

  if (!agentName) return <div className="text-sm text-gray-500">Select an agent to see details</div>;

  return (
    <div>
      <h2 className="font-medium mb-3">Agent: {agentName}</h2>

      <div className="mb-4">
        <div className="text-xs text-gray-500">Registry record</div>
        <pre className="bg-gray-50 p-2 rounded text-sm">{resolve ? JSON.stringify(resolve, null, 2) : "-"}</pre>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500">AgentFacts (signed)</div>
        <pre className="bg-gray-50 p-2 rounded text-sm">{facts ? JSON.stringify(facts, null, 2) : "-"}</pre>
        <div className="mt-2">
          <span className="text-sm">Signature verification:</span>
          <span className={`ml-2 font-semibold ${verify? 'text-green-600': verify===false? 'text-red-600' : 'text-gray-500'}`}>
            {verify === null ? 'unknown' : verify ? 'valid' : 'invalid'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500">Invoke agent</div>
        <div className="flex gap-2 mt-2">
          <input className="flex-1 p-2 border rounded" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="query" />
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={handleInvoke}>Invoke</button>
        </div>
        <div className="mt-2">
          <pre className="bg-gray-50 p-2 rounded text-sm">{invokeResp ? JSON.stringify(invokeResp, null, 2) : "-"}</pre>
        </div>
      </div>
    </div>
  );
}
