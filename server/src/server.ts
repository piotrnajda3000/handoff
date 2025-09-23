import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { runAnnotateWorkflow } from "./routes/generate-tests/generate-tests.utils.js";
import {
  AnnotateRequestSchema,
  AnnotateResponseSchema,
  ErrorResponseSchema,
  type AnnotateRequest,
  type AnnotateResponse,
  type ErrorResponse,
} from "./shared/schemas.js";

async function buildApp() {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Global error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error, `Error in ${request.method} ${request.url}`);

    // Handle validation errors (from schema validation)
    if ("validation" in error && error.validation) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.validation,
      });
    }

    // Handle all other errors as 500
    return reply.status(500).send({
      error: "Internal server error",
    });
  });

  // Add CORS headers
  fastify.addHook("preHandler", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  });

  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  // Handle preflight OPTIONS requests
  fastify.options("*", async (request, reply) => {
    return reply.status(200).send();
  });

  // Route to run annotation workflow with schema validation
  fastify.post<{
    Body: AnnotateRequest;
    Reply: AnnotateResponse;
    ReplyError: ErrorResponse;
  }>(
    "/annotate",
    {
      schema: {
        body: AnnotateRequestSchema,
        response: {
          200: AnnotateResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { fileName, text } = request.body;
      const result = await runAnnotateWorkflow(fileName, text);
      return reply.status(200).send(result);
    }
  );

  return fastify;
}

/**
 * Run the server!
 */
const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: 3000 });
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};
start();
