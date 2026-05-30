import "dotenv/config";
import { verifyPayload } from "@nanda/crypto-utils";
import {
  validateAgentFacts,
  validateSignedAgentFacts,
  type AgentFacts,
  type AgentAddr
} from "@nanda/shared-types";

interface ResolvedAgent extends AgentAddr {
  agentName?: string;
  agentAddr?: string;
  registeredAt?: string;
}

interface CliOptions {
  agentName: string;
  tamper: boolean;
}

const indexServiceUrl = process.env.INDEX_SERVICE_URL ?? "http://localhost:3000";
const useLocalHostRewrite = process.env.RESOLVER_USE_LOCALHOST !== "false";

function parseCliOptions(argv: string[]): CliOptions {
  const tamper = argv.includes("--tamper");
  const agentName = argv.find((arg) => arg !== "--tamper");

  if (!agentName) {
    printUsageAndExit();
  }

  return { agentName, tamper };
}

function printUsageAndExit(): never {
  console.error("Usage: pnpm resolve <agent-name> [--tamper]");
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

function tamperPayload(payload: AgentFacts): { tampered: AgentFacts; field: string; original: string; modified: string } {
  const tampered: AgentFacts = { ...payload, capabilities: [...payload.capabilities] };
  const field = "version";
  const original = tampered.version;
  const modified = `${original}-tampered`;
  tampered.version = modified;

  return { tampered, field, original, modified };
}

function formatConnectionError(error: unknown, target: string): Error {
  const message = error instanceof Error ? error.message : String(error);
  const isConnectionFailure =
    message.includes("fetch failed") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("ECONNRESET");

  if (isConnectionFailure) {
    return new Error(
      `Cannot connect to ${target}. Start services first with "pnpm dev:clean", wait a few seconds, then run resolve again.`
    );
  }

  return error instanceof Error ? error : new Error(message);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    throw formatConnectionError(error, url);
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} (${url})`);
  }
  return (await response.json()) as T;
}

async function listRegisteredAgents(): Promise<string[]> {
  try {
    const agents = await fetchJson<Array<{ agent_name?: string; agentName?: string }>>(
      `${indexServiceUrl}/agents`
    );
    return agents
      .map((agent) => agent.agent_name ?? agent.agentName ?? "")
      .filter((name) => name.length > 0);
  } catch {
    return [];
  }
}

async function resolveAgent(agentName: string): Promise<ResolvedAgent> {
  const resolveUrl = `${indexServiceUrl}/resolve/${encodeURIComponent(agentName)}`;
  let response: Response;
  try {
    response = await fetch(resolveUrl);
  } catch (error) {
    throw formatConnectionError(error, indexServiceUrl);
  }

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
  const { agentName, tamper } = parseCliOptions(process.argv.slice(2));

  try {
    console.log(`Resolving agent: ${agentName}`);
    if (tamper) {
      console.log("Tamper mode: enabled (--tamper)");
    }

    const resolved = await resolveAgent(agentName);
    // Use new AgentAddr format: primary_facts_url instead of agentAddr
    const factEndpoint = resolved.primary_facts_url || resolved.agentAddr;
    if (!factEndpoint) {
      throw new Error("No facts URL found in agent resolution");
    }
    const factsUrl = toLocalDevUrl(factEndpoint);

    console.log(`Resolved address: ${factEndpoint}`);
    console.log(`TTL: ${resolved.ttl}s`);
    if (factsUrl !== factEndpoint) {
      console.log(`Fetching facts via: ${factsUrl}`);
    }
    console.log(`Registered at: ${resolved.signed_at || resolved.registeredAt}`);

    const signedFactsRaw = await fetchJson<unknown>(factsUrl);
    const signedFacts = validateSignedAgentFacts(signedFactsRaw);
    const facts = validateAgentFacts(signedFacts.payload);

    console.log("\nFetched AgentFacts:");
    console.log(JSON.stringify(facts, null, 2));

    const tamperInfo = tamper ? tamperPayload(signedFacts.payload) : null;
    const payloadForVerification = tamperInfo ? tamperInfo.tampered : signedFacts.payload;

    if (tamperInfo) {
      console.log("\nPayload was modified (tamper demo):");
      console.log(`- field: ${tamperInfo.field}`);
      console.log(`- original: ${tamperInfo.original}`);
      console.log(`- modified: ${tamperInfo.modified}`);
    }

    const signatureValid = verifyPayload(
      payloadForVerification,
      signedFacts.signature,
      signedFacts.payload.publicKey
    );

    console.log(`\nSignature verification: ${signatureValid ? "SUCCESS" : "FAILED"}`);

    if (tamper) {
      if (!signatureValid) {
        console.log("Tampering detected: signature does not match modified payload.");
        console.log("\nTamper demonstration completed successfully (invalid signature rejected).");
        return;
      }

      console.error("Unexpected: tampered payload verified successfully.");
      process.exit(1);
    }

    if (!signatureValid) {
      console.log("Signature verification failed.");
      process.exit(1);
    }

    console.log("\nCapabilities:");
    for (const capability of facts.capabilities) {
      console.log(`- ${capability}`);
    }

    // Support both legacy endpoint field and new endpoints structure
    const endpointUrl = facts.endpoint || facts.endpoints?.static?.[0];
    if (!endpointUrl) {
      console.error("No endpoint found in agent facts");
      process.exit(1);
    }

    const invokeUrl = toLocalDevUrl(endpointUrl);
    const invokePayload = buildInvokePayload(facts);
    if (invokeUrl !== endpointUrl) {
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
