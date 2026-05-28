import "dotenv/config";
import Fastify from "fastify";
import { healthRoutes } from "./routes/health.routes";
import { weatherRoutes } from "./routes/weather.routes";
import { registerWithIndexService } from "./services/index-registration.service";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3002);
const host = process.env.HOST ?? "0.0.0.0";
const registerUrl = process.env.INDEX_SERVICE_REGISTER_URL ?? "http://index-service:3000/register";
const agentAddr = process.env.AGENT_PUBLIC_ADDR ?? `http://weather-agent:${port}/facts`;

void app.register(healthRoutes);
void app.register(weatherRoutes);

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
    void registerWithIndexService(app.log, {
      agentName: "weather.agent",
      agentAddr,
      registerUrl,
      maxAttempts: 10,
      retryDelayMs: 2000
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
