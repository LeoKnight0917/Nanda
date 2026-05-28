import "dotenv/config";
import Fastify from "fastify";
import { agentRoutes } from "./routes/agent.routes";
import { healthRoutes } from "./routes/health.routes";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

void app.register(healthRoutes);
void app.register(agentRoutes);

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
