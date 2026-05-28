FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY services/finance-agent/package.json services/finance-agent/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/crypto-utils/package.json packages/crypto-utils/package.json

RUN pnpm install --frozen-lockfile=false

COPY services/finance-agent services/finance-agent
COPY packages/shared-types packages/shared-types
COPY packages/crypto-utils packages/crypto-utils

RUN pnpm --filter @nanda/shared-types build && pnpm --filter @nanda/crypto-utils build && pnpm --filter @nanda/finance-agent build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json ./
COPY --from=builder /app/services/finance-agent/package.json services/finance-agent/package.json
COPY --from=builder /app/packages/shared-types/package.json packages/shared-types/package.json
COPY --from=builder /app/packages/crypto-utils/package.json packages/crypto-utils/package.json

RUN pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/services/finance-agent/dist services/finance-agent/dist
COPY --from=builder /app/packages/shared-types/dist packages/shared-types/dist
COPY --from=builder /app/packages/crypto-utils/dist packages/crypto-utils/dist

EXPOSE 3003
CMD ["node", "services/finance-agent/dist/server.js"]
