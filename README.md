# NANDA Index — Prototype Monorepo

Concise, practical prototype of the NANDA Index protocol. This repository demonstrates a minimal index service, example agents, signing/verification of AgentFacts, and a small React dashboard for visualising the protocol.

**Audience:** backend engineers building a discovery/registration index and secure agent invocation flow.

---

**Repository layout**
- [services/index-service](services/index-service#L1): Index (registry) service. Exposes `/register`, `/resolve/:agentName`, `/agents`, and `/verify-facts`.
- [services/weather-agent](services/weather-agent#L1): Example agent that serves signed AgentFacts at `/facts` and an `/invoke` endpoint.
- [services/finance-agent](services/finance-agent#L1): Another example agent.
- [packages/shared-types](packages/shared-types#L1): Shared TypeScript types and Zod schemas.
- [packages/crypto-utils](packages/crypto-utils#L1): Ed25519 helpers and canonical JSON serialization.
- [packages/dashboard](packages/dashboard#L1): Lightweight Vite + React + TypeScript + Tailwind dashboard.

Goals: clarity and correctness over feature depth. Keep the protocol surface small and explicit.

---

**Design summary**
- Agents register with the Index by POST `/register` providing `agentName` and `agentAddr` (a public URL pointing to the agent's facts endpoint).
- The Index stores a simple `AgentRecord { agentName, agentAddr, registeredAt }` in-memory.
- Agents publish `AgentFacts` (a JSON payload) and a detached Ed25519 signature.
- AgentFacts contain a canonical payload including `agentId`, `version`, `capabilities`, `endpoint` (the invoke URL), `publicKey`, and `issuedAt`.
- The Index exposes `/verify-facts` which accepts `{ payload, signature }` and returns whether the signature is valid (delegates to `packages/crypto-utils`).
- The dashboard resolves agents, fetches their facts, asks the Index to verify signatures, and performs invocation against the agent `endpoint`.

---

**NANDA Index flow (concise)**
1. Agent starts and determines its public `agentAddr` (URL to facts).
2. Agent POSTs `{"agentName","agentAddr"}` to Index `POST /register` (Index stores the record).
3. Clients query Index `GET /resolve/:agentName` to obtain `agentAddr`.
4. Clients fetch `GET {agentAddr}` (AgentFacts) and verify signature.
5. Clients invoke agent via the `endpoint` declared inside AgentFacts.

---

**AgentAddr**
- `agentAddr` is a publicly reachable URL that points _to the agent's facts document_. In the examples this is `http://host:port/facts`.
- Using a canonical facts URL simplifies discovery: the Index does not need to guess paths or ports.
- Agents may set `AGENT_PUBLIC_ADDR` to override runtime discovery / NAT mappings.

---

**AgentFacts (signed)**
- Structure (payload):
  - `agentId` (string)
  - `version` (string)
  - `capabilities` (string[])
  - `endpoint` (string) — canonical invoke URL (e.g. `http://host:port/invoke`)
  - `publicKey` (PEM) — Ed25519 public key, PEM-wrapped
  - `issuedAt` (ISO timestamp)
- Signed envelope: `{ payload, signature }` where `signature` is Base64 of the Ed25519 signature over the canonical JSON string of `payload`.
- The project uses `packages/crypto-utils` which performs canonical JSON serialization before signing/verifying. This prevents signature failures due to key ordering or formatting.

---

**Signature verification flow**
1. Client requests AgentFacts from `agentAddr`.
2. Client sends the `payload` and `signature` to Index `POST /verify-facts` (or verifies locally using the `publicKey`).
3. Index calls `verifyPayload(payload, signature, payload.publicKey)` in `packages/crypto-utils`, which:
   - canonicalises `payload` (deterministic ordering)
   - verifies the Ed25519 signature
   - returns boolean result
4. If verification is valid, client trusts `payload.endpoint` for invocation.

Note: The repository provides server-side verification in the Index to keep the dashboard lightweight; a production client should verify signatures locally.

---

## Setup
Prerequisites: Node.js 18+, pnpm, Docker (if using compose).

From repo root:

```bash
pnpm install
```

Start development services (index + agents):

```bash
pnpm dev
```

Start the dashboard (separate terminal):

```bash
cd packages/dashboard
pnpm install
pnpm dev
# open http://localhost:5173
```

Environment variables (examples inside each service `.env`/`.env.example`):
- `INDEX_SERVICE_REGISTER_URL` — where agents POST to register (default `http://localhost:3000/register`)
- `AGENT_PUBLIC_ADDR` — override the public facts URL agents register with

---

## Docker / docker-compose
A `docker-compose.yml` is included for convenience: it builds and runs Index + agents in a network.

Run locally with Docker:

```bash
# build and start
docker compose up --build

# stop and remove
docker compose down
```

The compose file sets up healthchecks so the stack becomes operational automatically.

---

## Demo / quick commands
Assuming services running locally (index: `http://localhost:3000`, weather agent: `http://localhost:3002`):

- List registered agents:
```bash
curl http://localhost:3000/agents
```

- Resolve an agent:
```bash
curl http://localhost:3000/resolve/weather.agent
```

- Fetch agent facts:
```bash
curl http://localhost:3002/facts
```

- Verify facts with the index (server-side verify):
```bash
curl http://localhost:3002/facts -o /tmp/facts.json
curl -X POST http://localhost:3000/verify-facts -H "Content-Type: application/json" --data-binary @/tmp/facts.json
```

- Invoke the agent (use `endpoint` from facts payload):
```bash
curl -X POST http://localhost:3002/invoke -H "Content-Type: application/json" -d '{"query":"What's the weather?"}'
```

---

## Tampering demo (how to exercise signature failure)
1. Save the published facts:
```bash
curl http://localhost:3002/facts -o /tmp/facts.json
```
2. Tamper the payload (change a field in `payload`, e.g., `capabilities` or `endpoint`).
3. POST to Index verify:
```bash
curl -X POST http://localhost:3000/verify-facts -H "Content-Type: application/json" --data-binary @/tmp/facts.json
# expected: {"success":true,"valid":false}
```
Tampering the payload without re-signing will make verification fail.

---

## Architecture diagram
```mermaid
flowchart LR
  subgraph Index
    IDX[index-service]
  end
  subgraph AgentA[weather-agent]
    AFA[ /facts (signed) ]
    APIA[ /invoke ]
  end
  subgraph AgentB[finance-agent]
    AFB[ /facts (signed) ]
    APIB[ /invoke ]
  end
  Client[Client / Dashboard]

  AgentA -->|POST /register {agentName, agentAddr}| IDX
  AgentB -->|POST /register {agentName, agentAddr}| IDX

  Client -->|GET /resolve/:agentName| IDX
  IDX -->|returns agentAddr| Client
  Client -->|GET agentAddr| AgentA
  Client -->|POST {payload,signature} -> /verify-facts| IDX
  IDX -->|valid: true/false| Client
  Client -->|POST -> payload.endpoint| AgentA
```

---

## Developer notes / recent fixes
- Dashboard `AgentDetails` fetch logic was corrected to handle `agentAddr` that already points at `/facts` and to use `AgentFacts.payload.endpoint` for invocations. This prevents double-`/facts` requests and ensures invocations hit the intended URL.
- Vite config in the dashboard uses a dynamic import for `@vitejs/plugin-react` to avoid ESM/CJS interop issues in this monorepo setup.

---

If you want, I can:
- Add a local verification helper to the dashboard to verify signatures client-side, or
- Harden the Index to persist the registry and add basic auth for registration.

</README>
