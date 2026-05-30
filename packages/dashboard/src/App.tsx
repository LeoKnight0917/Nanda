import React, { useEffect, useState } from "react";
import AgentList from "./components/AgentList.js";
import AgentDetails from "./components/AgentDetails.js";

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000");

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Nanda Dashboard</h1>
        <p className="text-sm text-gray-500">Protocol visualization & agent actions</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-white rounded shadow p-4 md:col-span-1">
          <AgentList apiBase={API_BASE} onSelect={(name: string) => setSelected(name)} selected={selected} />
        </div>

        <div className="bg-white rounded shadow p-4 md:col-span-2">
          <AgentDetails apiBase={API_BASE} agentName={selected} />
        </div>
      </div>
    </div>
  );
}
