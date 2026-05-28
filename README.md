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

Each service is an independent Fastify TypeScript app with:

- its own `package.json`
- `dev`, `build`, and `start` scripts
- `/health` endpoint
- Dockerfile
- `.env.example`

Default ports:

- `index-service`: `3001`
- `weather-agent`: `3002`
- `finance-agent`: `3003`
- `resolver-client`: `3004`

## Quick Start

```bash
pnpm install
pnpm dev
```

Build all workspaces:

```bash
pnpm build
```

Run with Docker Compose:

```bash
docker compose up --build
```

## Notes

- No business logic is implemented yet.
- `packages/shared-types` holds cross-service types.
- `packages/crypto-utils` is reserved for shared crypto helpers.
