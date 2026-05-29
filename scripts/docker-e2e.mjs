import { spawnSync } from "node:child_process";

const indexUrl = process.env.INDEX_SERVICE_URL ?? "http://index-service:3000";
const requiredAgents = ["weather.agent", "finance.agent"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAgents() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${indexUrl}/agents`);
      if (!response.ok) {
        console.log(`[e2e] index-service not ready (attempt ${attempt})`);
        await sleep(2000);
        continue;
      }

      const agents = await response.json();
      const names = agents.map((agent) => agent.agentName);
      const missing = requiredAgents.filter((name) => !names.includes(name));

      if (missing.length === 0) {
        console.log(`[e2e] Agents registered: ${names.join(", ")}`);
        return;
      }

      console.log(
        `[e2e] Waiting for agents (attempt ${attempt})... missing: ${missing.join(", ")}`
      );
    } catch {
      console.log(`[e2e] Waiting for index-service (attempt ${attempt})...`);
    }

    await sleep(2000);
  }

  throw new Error("Timed out waiting for agent registration");
}

function runResolve(agentName) {
  console.log(`\n[e2e] Resolving ${agentName}...`);
  const result = spawnSync("node", ["services/resolver-client/dist/cli.js", agentName], {
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(`Resolve failed for ${agentName}`);
  }
}

await waitForAgents();

for (const agentName of requiredAgents) {
  runResolve(agentName);
}

console.log("\n[e2e] Smoke tests passed for weather.agent and finance.agent");
