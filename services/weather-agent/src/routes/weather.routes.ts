import type { FastifyPluginAsync } from "fastify";
import { invokeBodySchema } from "../schemas/invoke.schema";
import { AgentFactsService } from "../services/agent-facts.service";
import { WeatherResponseService } from "../services/weather-response.service";

const servicePort = process.env.PORT ?? "3002";
const factsEndpoint =
  process.env.AGENT_ENDPOINT ?? `http://localhost:${servicePort}/invoke`;

const agentFactsService = new AgentFactsService(factsEndpoint);
const weatherResponseService = new WeatherResponseService();

export const weatherRoutes: FastifyPluginAsync = async (app) => {
  app.get("/facts", async (request, reply) => {
    const signedFacts = agentFactsService.getSignedFacts();
    request.log.info(
      {
        agentId: signedFacts.payload.agentId,
        issuedAt: signedFacts.payload.issuedAt
      },
      "Returning signed agent facts"
    );
    return reply.code(200).send(signedFacts);
  });

  app.get("/invoke", async (request, reply) => {
    reply.header("Allow", "POST");
    return reply.code(405).send({
      success: false,
      error: "Use POST /invoke with JSON body { query: 'Your location' }"
    });
  });

  app.post("/invoke", async (request, reply) => {
    const parsed = invokeBodySchema.safeParse(request.body);
    if (!parsed.success) {
      request.log.warn(
        { issueCount: parsed.error.issues.length },
        "Invalid invoke payload"
      );
      return reply.code(400).send({
        success: false,
        error: "Invalid request body"
      });
    }

    const result = weatherResponseService.createResponse(parsed.data);
    request.log.info({ query: parsed.data.query }, "Weather query handled");
    return reply.code(200).send(result);
  });
};
