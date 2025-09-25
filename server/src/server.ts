import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  reportAgent,
  runAnalyzeDependenciesWorkflow,
  runAnnotateWorkflow,
} from "./routes/generate-tests/generate-tests.js";
import {
  testRepoConnection,
  listRepoFiles,
  getRepoFileContent,
} from "./routes/repo/repo.utils.js";
import {
  AnnotateRequestSchema,
  AnnotateResponseSchema,
  ErrorResponseSchema,
  RepoTestConnectionRequestSchema,
  RepoListFilesRequestSchema,
  RepoListFilesResponseSchema,
  RepoGetFileContentRequestSchema,
  RepoGetFileContentResponseSchema,
  type AnnotateRequest,
  type AnnotateResponse,
  type ErrorResponse,
  type RepoTestConnectionRequest,
  type RepoListFilesRequest,
  type RepoListFilesResponse,
  type RepoGetFileContentRequest,
  type RepoGetFileContentResponse,
  GenerateReportResponseSchema,
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

  fastify.post("/test", {}, async (request, reply) => {
    const result = await reportAgent.invoke({
      files: [
        {
          name: "file1.ts",
          text: "console.log('Hello, world!');",
          annotatedText: "// # Console log\nconsole.log('Hello, world!');",
          path: "file1.ts",
          annotations: ["# Console log"],
          dependents: [],
        },
      ],
    });
    return reply.status(200).send(result.messages.at(-1)?.text);
  });

  // Route to run annotation workflow with schema validation
  fastify.post<{
    Body: AnnotateRequest;
    ReplyError: ErrorResponse;
  }>(
    "/generate-report",
    {
      schema: {
        body: AnnotateRequestSchema,
        response: {
          200: GenerateReportResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      console.log("🔍 Generate Report - Input");
      console.log("================================================");
      console.log(JSON.stringify({ body: request.body }, null, 2));
      console.log("================================================");

      console.log("🔍 Generate Report - Annotating");
      console.log("================================================");
      const annotations = await Promise.all(
        request.body.map((item) => runAnnotateWorkflow(item))
      );
      const filesWithAnnotations = request.body.map((item) => ({
        ...item,
        ...annotations.find((a) => a.path === item.path)!,
      }));

      console.log("🔍 Generate Report - Analyzing dependenices");
      console.log("================================================");
      const filesWithDependencyAnnotations = await Promise.all(
        filesWithAnnotations.flatMap((item) =>
          item.dependents.map((dependent) =>
            runAnalyzeDependenciesWorkflow({
              from: item,
              to: {
                ...dependent,
                annotations:
                  filesWithAnnotations.find((a) => a.path === dependent.path)
                    ?.annotations ?? [],
              },
            })
          )
        )
      );

      const final = filesWithAnnotations.map((item) => ({
        ...item,
        dependents: item.dependents.map((dependent) => ({
          ...dependent,
          analysis: filesWithDependencyAnnotations.find(
            (a) => a.to.path === dependent.path && a.from.path === item.path
          )?.from.analysis,
        })),
      }));

      console.log("================================================");
      console.log("🔍 Generating Final Report for");
      console.log(JSON.stringify({ final }, null, 2));
      console.log("================================================");
      const report = await reportAgent.invoke(
        {
          files: final,
        },
        {
          recursionLimit: 60,
        }
      );

      return reply.status(200).send({
        report: report.messages.at(-1)?.text ?? "",
        files: final,
      });
    }
  );

  // Repository connection endpoints
  fastify.post<{
    Body: RepoTestConnectionRequest;
    Reply: {};
    ReplyError: ErrorResponse;
  }>(
    "/repo/test-connection",
    {
      schema: {
        body: RepoTestConnectionRequestSchema,
        response: {
          200: {},
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      await testRepoConnection(request.body);
      return reply.status(200).send({});
    }
  );

  fastify.post<{
    Body: RepoListFilesRequest;
    Reply: RepoListFilesResponse;
    ReplyError: ErrorResponse;
  }>(
    "/repo/list-files",
    {
      schema: {
        body: RepoListFilesRequestSchema,
        response: {
          200: RepoListFilesResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const files = await listRepoFiles(request.body);
      return reply.status(200).send(files);
    }
  );

  fastify.post<{
    Body: RepoGetFileContentRequest;
    Reply: RepoGetFileContentResponse;
    ReplyError: ErrorResponse;
  }>(
    "/repo/get-file-content",
    {
      schema: {
        body: RepoGetFileContentRequestSchema,
        response: {
          200: RepoGetFileContentResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const content = await getRepoFileContent(request.body);
      return reply.status(200).send({ content });
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
    await app.listen({ port: 8080 });
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};
start();
