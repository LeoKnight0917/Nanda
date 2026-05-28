import type { FastifyBaseLogger } from "fastify";

interface RegistrationConfig {
  agentName: string;
  agentAddr: string;
  registerUrl: string;
  maxAttempts: number;
  retryDelayMs: number;
}

interface RegistrationBody {
  agentName: string;
  agentAddr: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postRegistration(
  registerUrl: string,
  body: RegistrationBody
): Promise<Response> {
  return fetch(registerUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

export async function registerWithIndexService(
  logger: FastifyBaseLogger,
  config: RegistrationConfig
): Promise<void> {
  const body: RegistrationBody = {
    agentName: config.agentName,
    agentAddr: config.agentAddr
  };

  for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
    try {
      logger.info(
        {
          attempt,
          registerUrl: config.registerUrl,
          agentName: config.agentName
        },
        "Registering finance-agent with index-service"
      );

      const response = await postRegistration(config.registerUrl, body);
      if (response.ok) {
        logger.info(
          { statusCode: response.status, agentName: config.agentName },
          "Finance-agent registration succeeded"
        );
        return;
      }

      if (response.status === 409) {
        logger.info(
          { statusCode: response.status, agentName: config.agentName },
          "Finance-agent already registered in index-service"
        );
        return;
      }

      logger.warn(
        {
          attempt,
          statusCode: response.status,
          statusText: response.statusText
        },
        "Finance-agent registration failed"
      );
    } catch (error) {
      logger.warn(
        {
          attempt,
          error: error instanceof Error ? error.message : String(error)
        },
        "Finance-agent registration request failed"
      );
    }

    if (attempt < config.maxAttempts) {
      await sleep(config.retryDelayMs);
    }
  }

  logger.error(
    {
      attempts: config.maxAttempts,
      registerUrl: config.registerUrl,
      agentName: config.agentName
    },
    "Finance-agent could not register with index-service, continuing startup"
  );
}
