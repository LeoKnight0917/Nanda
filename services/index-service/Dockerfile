FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY services/index-service/package.json services/index-service/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --frozen-lockfile=false

COPY services/index-service services/index-service
COPY packages/shared-types packages/shared-types

RUN pnpm --filter @nanda/shared-types build && pnpm --filter @nanda/index-service build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json ./
COPY --from=builder /app/services/index-service/package.json services/index-service/package.json
COPY --from=builder /app/packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/services/index-service/dist services/index-service/dist
COPY --from=builder /app/packages/shared-types/dist packages/shared-types/dist

EXPOSE 3001
CMD ["node", "services/index-service/dist/server.js"]
