import "dotenv/config";
import Fastify from "fastify";
import type { HealthResponse } from "@nanda/shared-types";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3003);
const host = process.env.HOST ?? "0.0.0.0";

app.get("/health", async (): Promise<HealthResponse> => {
  return {
    status: "ok",
    service: "finance-agent",
    timestamp: new Date().toISOString()
  };
});

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
