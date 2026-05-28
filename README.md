# NANDA Index Protocol - Prototype Monorepo

Production-style TypeScript monorepo scaffold for the NANDA Index protocol prototype.

## Tech Stack

- Node.js
- TypeScript
- pnpm workspaces
- Docker Compose
- Fastify
- ESLint
- Prettier
- dotenv

## Structure

```text
project-nanda/
├── services/
│   ├── index-service/
│   ├── weather-agent/
│   ├── finance-agent/
│   └── resolver-client/
├── packages/
│   ├── shared-types/
│   └── crypto-utils/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Services

Each HTTP service is an independent Fastify TypeScript app with:

- its own `package.json`
- `dev`, `build`, and `start` scripts
- `/health` endpoint
- Dockerfile
- `.env.example`

`resolver-client` is a CLI tool (not an HTTP server).

Default ports:

- `index-service`: `3000`
- `weather-agent`: `3002`
- `finance-agent`: `3003`

## Quick Start

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts index-service, weather-agent, and finance-agent. Agents auto-register with index-service on startup.

If you see `EADDRINUSE` (port already in use), stop old dev processes and restart:

```bash
pnpm stop
pnpm dev
```

Or in one command:

```bash
pnpm dev:clean
```

Build all workspaces:

```bash
pnpm build
```

Run with Docker Compose:

```bash
docker compose up --build
```

Resolve and invoke an agent via CLI (with services running):

```bash
pnpm resolve weather.agent
pnpm resolve finance.agent
```

Tampering demonstration (signature verification must fail):

```bash
pnpm resolve weather.agent --tamper
```

Docker CLI resolve example:

```bash
docker compose --profile tools run --rm resolver-client weather.agent
```

## Notes

- `packages/shared-types` holds cross-service types and zod schemas.
- `packages/crypto-utils` provides Ed25519 signing utilities.
