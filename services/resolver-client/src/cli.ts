import "dotenv/config";
import { verifyPayload } from "@nanda/crypto-utils";
import {
  validateAgentFacts,
  validateSignedAgentFacts,
  type AgentFacts
} from "@nanda/shared-types";

interface ResolvedAgent {
  agentName: string;
  agentAddr: string;
  registeredAt: string;
}

const indexServiceUrl = process.env.INDEX_SERVICE_URL ?? "http://localhost:3000";
const useLocalHostRewrite = process.env.RESOLVER_USE_LOCALHOST !== "false";

function printUsageAndExit(): never {
  console.error("Usage: pnpm resolve <agent-name>");
  process.exit(1);
}

/** Map Docker service hostnames to localhost when running the CLI on the host machine. */
function toLocalDevUrl(url: string): string {
  if (!useLocalHostRewrite) {
    return url;
  }

  return url
    .replace("http://weather-agent:", "http://localhost:")
    .replace("http://finance-agent:", "http://localhost:")
    .replace("https://weather-agent:", "https://localhost:")
    .replace("https://finance-agent:", "https://localhost:");
}

function buildInvokePayload(facts: AgentFacts): Record<string, string> {
  if (facts.capabilities.includes("weather-query")) {
    return { query: "weather in berlin" };
  }

  if (facts.capabilities.includes("stock-price-query")) {
    return { ticker: "AAPL" };
  }

  return { query: "health check" };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} (${url})`);
  }
  return (await response.json()) as T;
}

async function listRegisteredAgents(): Promise<string[]> {
  try {
    const agents = await fetchJson<Array<{ agentName: string }>>(
      `${indexServiceUrl}/agents`
    );
    return agents.map((agent) => agent.agentName);
  } catch {
    return [];
  }
}

async function resolveAgent(agentName: string): Promise<ResolvedAgent> {
  const resolveUrl = `${indexServiceUrl}/resolve/${encodeURIComponent(agentName)}`;
  const response = await fetch(resolveUrl);

  if (response.status === 404) {
    const registered = await listRegisteredAgents();
    const hint =
      registered.length > 0
        ? `Registered agents: ${registered.join(", ")}`
        : "No agents registered. Start index-service and weather-agent/finance-agent first.";
    throw new Error(`Agent not found: ${agentName}. ${hint}`);
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} (${resolveUrl})`);
  }

  return (await response.json()) as ResolvedAgent;
}

async function run(): Promise<void> {
  const agentName = process.argv[2];
  if (!agentName) {
    printUsageAndExit();
  }

  try {
    console.log(`Resolving agent: ${agentName}`);
    const resolved = await resolveAgent(agentName);
    const factsUrl = toLocalDevUrl(resolved.agentAddr);

    console.log(`Resolved address: ${resolved.agentAddr}`);
    if (factsUrl !== resolved.agentAddr) {
      console.log(`Fetching facts via: ${factsUrl}`);
    }
    console.log(`Registered at: ${resolved.registeredAt}`);

    const signedFactsRaw = await fetchJson<unknown>(factsUrl);
    const signedFacts = validateSignedAgentFacts(signedFactsRaw);
    const facts = validateAgentFacts(signedFacts.payload);

    console.log("\nFetched AgentFacts:");
    console.log(JSON.stringify(facts, null, 2));

    const signatureValid = verifyPayload(
      signedFacts.payload,
      signedFacts.signature,
      facts.publicKey
    );
    console.log(`\nSignature verification: ${signatureValid ? "SUCCESS" : "FAILED"}`);
    if (!signatureValid) {
      process.exit(1);
    }

    console.log("\nCapabilities:");
    for (const capability of facts.capabilities) {
      console.log(`- ${capability}`);
    }

    const invokeUrl = toLocalDevUrl(facts.endpoint);
    const invokePayload = buildInvokePayload(facts);
    if (invokeUrl !== facts.endpoint) {
      console.log(`\nInvoking via: ${invokeUrl}`);
    }

    const invocationResult = await fetchJson<unknown>(invokeUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(invokePayload)
    });

    console.log("\nInvocation result:");
    console.log(JSON.stringify(invocationResult, null, 2));
  } catch (error) {
    console.error(
      "Resolver error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

void run();
