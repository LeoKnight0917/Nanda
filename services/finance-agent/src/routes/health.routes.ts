import type { FastifyPluginAsync } from "fastify";
import type { HealthResponse } from "@nanda/shared-types";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async (): Promise<HealthResponse> => {
    return {
      status: "ok",
      service: "finance-agent",
      timestamp: new Date().toISOString()
    };
  });
};
