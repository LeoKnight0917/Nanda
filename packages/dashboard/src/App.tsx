import React, { useEffect, useState } from "react";
import AgentList from "./components/AgentList";
import AgentDetails from "./components/AgentDetails";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Nanda Dashboard</h1>
        <p className="text-sm text-gray-500">Protocol visualization & agent actions</p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded shadow p-4">
          <AgentList apiBase={API_BASE} onSelect={(name) => setSelected(name)} selected={selected} />
        </div>

        <div className="col-span-2 bg-white rounded shadow p-4">
          <AgentDetails apiBase={API_BASE} agentName={selected} />
        </div>
      </div>
    </div>
  );
}
