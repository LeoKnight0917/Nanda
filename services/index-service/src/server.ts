import "dotenv/config";
import Fastify from "fastify";
import { agentRoutes } from "./routes/agent.routes";
import { healthRoutes } from "./routes/health.routes";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

void app.register(healthRoutes);
void app.register(agentRoutes);

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
  } catch (error) {
    logListenError(error);
    process.exit(1);
  }
}

void start();
