import "dotenv/config";
import Fastify from "fastify";
import { healthRoutes } from "./routes/health.routes";
import { weatherRoutes } from "./routes/weather.routes";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3002);
const host = process.env.HOST ?? "0.0.0.0";

void app.register(healthRoutes);
void app.register(weatherRoutes);

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
