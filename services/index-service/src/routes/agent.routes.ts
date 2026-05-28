import type { FastifyPluginAsync } from "fastify";
import {
  registerAgentBodySchema,
  resolveAgentParamsSchema
} from "../schemas/agent.schema";
import { AgentRegistryService } from "../services/agent-registry.service";

const agentRegistryService = new AgentRegistryService();

export const agentRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const parsedBody = registerAgentBodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      request.log.warn(
        { issueCount: parsedBody.error.issues.length },
        "Invalid register payload"
      );
      return reply.code(400).send({
        success: false,
        error: "Invalid request body"
      });
    }

    const created = agentRegistryService.registerAgent(parsedBody.data);
    if (!created) {
      request.log.info({ agentName: parsedBody.data.agentName }, "Agent already registered");
      return reply.code(409).send({
        success: false,
        error: "Agent already registered"
      });
    }

    request.log.info(
      {
        agentName: parsedBody.data.agentName,
        agentAddr: parsedBody.data.agentAddr
      },
      "Agent registered"
    );
    return reply.code(201).send({ success: true });
  });

  app.get("/resolve/:agentName", async (request, reply) => {
    const parsedParams = resolveAgentParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      request.log.warn(
        { issueCount: parsedParams.error.issues.length },
        "Invalid resolve params"
      );
      return reply.code(400).send({
        success: false,
        error: "Invalid route params"
      });
    }

    const agent = agentRegistryService.resolveAgent(parsedParams.data.agentName);
    if (!agent) {
      request.log.info({ agentName: parsedParams.data.agentName }, "Agent not found");
      return reply.code(404).send({
        success: false,
        error: "Agent not found"
      });
    }

    request.log.info({ agentName: agent.agentName }, "Agent resolved");
    return reply.code(200).send(agent);
  });

  app.get("/agents", async (request, reply) => {
    const agents = agentRegistryService.getAllAgents();
    request.log.info({ count: agents.length }, "Listing agents");
    return reply.code(200).send(agents);
  });
};
