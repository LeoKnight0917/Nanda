import type { FastifyPluginAsync } from "fastify";
import {
  registerAgentBodySchema,
  resolveAgentParamsSchema
} from "../schemas/agent.schema";
import { AgentRegistryService } from "../services/agent-registry.service";
import { verifyPayload } from "@nanda/crypto-utils";
import type { SignedAgentFacts } from "@nanda/shared-types";

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

    request.log.info({ agentName: parsedParams.data.agentName }, "Agent resolved");
    return reply.code(200).send(agent);
  });

  app.get("/agents", async (request, reply) => {
    const agents = agentRegistryService.getAllAgents();
    request.log.info({ count: agents.length }, "Listing agents");
    return reply.code(200).send(agents);
  });

  // Verify AgentAddr signature (signed by index)
  app.post("/verify-agent-addr", async (request, reply) => {
    const body = request.body as any;
    if (!body || !body.agent_id || !body.signature) {
      return reply.code(400).send({ success: false, error: "Missing agent_id or signature" });
    }

    try {
      const publicKey = agentRegistryService.getIndexPublicKey();
      const payloadToVerify = {
        agent_id: body.agent_id,
        agent_name: body.agent_name,
        primary_facts_url: body.primary_facts_url,
        private_facts_url: body.private_facts_url,
        adaptive_resolver_url: body.adaptive_resolver_url,
        ttl: body.ttl,
        signed_at: body.signed_at
      };
      
      const valid = verifyPayload(payloadToVerify, body.signature, publicKey);
      return reply.code(200).send({ success: true, valid });
    } catch (err) {
      request.log.warn({ err }, "Failed to verify AgentAddr signature");
      return reply.code(500).send({ success: false, error: "Verification failure" });
    }
  });

  app.post("/verify-facts", async (request, reply) => {
    const body = request.body as SignedAgentFacts;
    if (!body || !body.payload || !body.signature) {
      return reply.code(400).send({ success: false, error: "Missing payload or signature" });
    }

    try {
      const publicKey = body.payload.publicKey;
      const valid = verifyPayload(body.payload, body.signature, publicKey);
      return reply.code(200).send({ success: true, valid });
    } catch (err) {
      request.log.warn({ err }, "Failed to verify signature");
      return reply.code(500).send({ success: false, error: "Verification failure" });
    }
  });

  // Endpoint for getting index public key (for verification)
  app.get("/public-key", async (request, reply) => {
    const publicKey = agentRegistryService.getIndexPublicKey();
    return reply.code(200).send({ publicKey });
  });
};
