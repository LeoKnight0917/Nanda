FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY services/weather-agent/package.json services/weather-agent/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --frozen-lockfile=false

COPY services/weather-agent services/weather-agent
COPY packages/shared-types packages/shared-types

RUN pnpm --filter @nanda/shared-types build && pnpm --filter @nanda/weather-agent build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json ./
COPY --from=builder /app/services/weather-agent/package.json services/weather-agent/package.json
COPY --from=builder /app/packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/services/weather-agent/dist services/weather-agent/dist
COPY --from=builder /app/packages/shared-types/dist packages/shared-types/dist

EXPOSE 3002
CMD ["node", "services/weather-agent/dist/server.js"]
