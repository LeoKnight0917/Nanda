import type { FastifyPluginAsync } from "fastify";
import { invokeBodySchema } from "../schemas/invoke.schema";
import { AgentFactsService } from "../services/agent-facts.service";
import { FinanceResponseService } from "../services/finance-response.service";

const servicePort = process.env.PORT ?? "3003";
const factsEndpoint =
  process.env.AGENT_ENDPOINT ?? `http://localhost:${servicePort}/invoke`;

const agentFactsService = new AgentFactsService(factsEndpoint);
const financeResponseService = new FinanceResponseService();

export const financeRoutes: FastifyPluginAsync = async (app) => {
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

    const result = financeResponseService.createResponse(parsed.data);
    request.log.info({ ticker: parsed.data.ticker }, "Stock query handled");
    return reply.code(200).send(result);
  });
};
