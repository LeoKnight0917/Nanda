import "dotenv/config";
import Fastify from "fastify";
import { financeRoutes } from "./routes/finance.routes";
import { healthRoutes } from "./routes/health.routes";
import { registerWithIndexService } from "./services/index-registration.service";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3003);
const host = process.env.HOST ?? "0.0.0.0";
const registerUrl =
  process.env.INDEX_SERVICE_REGISTER_URL ?? "http://localhost:3000/register";
const agentAddr = process.env.AGENT_PUBLIC_ADDR ?? `http://localhost:${port}/facts`;

void app.register(healthRoutes);
void app.register(financeRoutes);

function logListenError(error: unknown): void {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "EADDRINUSE"
  ) {
    app.log.error(
      { port },
      "Port already in use. Run \"pnpm stop\" from repo root, then \"pnpm dev\"."
    );
    return;
  }

  app.log.error(error);
}

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
    void registerWithIndexService(app.log, {
      agentName: "finance.agent",
      agentAddr,
      registerUrl,
      maxAttempts: 10,
      retryDelayMs: 2000
    });
  } catch (error) {
    logListenError(error);
    process.exit(1);
  }
}

void start();
