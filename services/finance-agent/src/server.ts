import "dotenv/config";
import Fastify from "fastify";
import { financeRoutes } from "./routes/finance.routes";
import { healthRoutes } from "./routes/health.routes";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3003);
const host = process.env.HOST ?? "0.0.0.0";

void app.register(healthRoutes);
void app.register(financeRoutes);

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
