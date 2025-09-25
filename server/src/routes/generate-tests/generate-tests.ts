import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  StateGraph,
  Annotation,
  getCurrentTaskInput,
} from "@langchain/langgraph";
import * as z from "zod";
import dotenv from "dotenv";
import fs from "fs";
import {
  type AnnotateRequest,
  type AnnotateResponse,
  type AnnotateRequestItem,
} from "../../shared/schemas.js";
import * as UTILS from "./utils.js";
import * as PROMPTS from "./prompts.js";
import * as MOCKS from "./mocks.js";
import { createAgent, HumanMessage, SystemMessage, tool } from "langchain";
import { RunnableConfig } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

// Graph state
const StateAnnotation = Annotation.Root({
  name: Annotation<string>,
  text: Annotation<string>,
  annotatedText: Annotation<string>,
  comments: Annotation<string[]>,
});

// Node functions
async function annotateNode(state: typeof StateAnnotation.State) {
  console.log("🔍 Annotation Node - Processing:", state.name);

  const prompt = PROMPTS.ANNOTATE_NODE_PROMPT.replace(
    "{name}",
    state.name
  ).replace("{code}", state.text);

  const msg = await llm.invoke(prompt);

  return { annotatedText: msg.content };
}

async function extractComments(state: typeof StateAnnotation.State) {
  console.log("🔍 Extract Comments Node - Processing:", state.name);

  const comments = UTILS.returnOnlyChangesToFile(
    state.text,
    state.annotatedText
  )
    .map((l) => l.trim())
    .filter(UTILS.filterComments);

  return {
    comments,
  };
}

const annotateWorkflow = new StateGraph(StateAnnotation)
  .addNode("annotate", annotateNode)
  .addNode("extractComments", extractComments)
  .addEdge("__start__", "annotate")
  .addEdge("annotate", "extractComments")
  .addEdge("extractComments", "__end__")
  .compile();

export async function runAnnotateWorkflow(
  item: AnnotateRequestItem
): Promise<AnnotateResponse> {
  const state = await annotateWorkflow.invoke({
    name: item.name,
    text: item.text,
  });
  console.log("🔍 Finished annotating file", item.name);
  return {
    path: item.path,
    annotations: state.comments,
    annotatedText: state.annotatedText,
  };
}

// =================================================================
// Dependency Analysis
// =================================================================

const StateDependencyAnalysis = Annotation.Root({
  from: Annotation<{
    name: string;
    path: string;
    annotations: string[];
  }>,
  to: Annotation<{
    name: string;
    path: string;
    annotations: string[];
  }>,
  fromToAnalysis: Annotation<string>,
});

const analyzeDependencies = async function analyzeDependencies(
  state: typeof StateDependencyAnalysis.State
) {
  console.log(
    "🔍 Analyze Dependencies Node - Processing:",
    `${state.from.name} -> ${state.to.name}`
  );

  const prompt = PROMPTS.DEPENDENCY_ANALYSIS_PROMPT.replace(
    /{fileAName}/g,
    state.from.name
  )
    .replace(/{fileBName}/g, state.to.name)
    .replace(
      /{fileAAnnotations}/g,
      state.from.annotations.map((a) => `- ${a}`).join("\n")
    )
    .replace(
      /{fileBAnnotations}/g,
      state.to.annotations.map((a) => `- ${a}`).join("\n")
    );

  const msg = await llm.invoke(prompt);

  return {
    fromToAnalysis: msg.content as string,
  };
};

const dependencyAnalysisWorkflow = new StateGraph(StateDependencyAnalysis)
  .addNode("analyzeDependencies", analyzeDependencies)
  .addEdge("__start__", "analyzeDependencies")
  .addEdge("analyzeDependencies", "__end__")
  .compile();

export async function runAnalyzeDependenciesWorkflow(item: {
  from: {
    name: string;
    path: string;
    annotations: string[];
  };
  to: {
    name: string;
    path: string;
    annotations: string[];
  };
}): Promise<{
  from: {
    path: string;
    analysis: string;
  };
  to: {
    path: string;
  };
}> {
  const state = await dependencyAnalysisWorkflow.invoke({
    from: item.from,
    to: item.to,
  });
  return {
    from: {
      path: item.from.path,
      analysis: state.fromToAnalysis,
    },
    to: {
      path: item.to.path,
    },
  };
}

// =================================================================
// Final report generation - general product report
// =================================================================

const StateFinalReport = Annotation.Root({
  report: Annotation<string>,
});

const llmHeavy = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

const customAgentState = z.object({
  files: z.array(
    z.object({
      name: z.string(),
      text: z.string(),
      annotatedText: z.string(),
      path: z.string(),
      annotations: z.array(z.string()),
      dependents: z.array(
        z.object({
          name: z.string(),
          path: z.string(),
          analysis: z.string().optional(),
        })
      ),
    })
  ),
});

type CustomAgentState = z.infer<typeof customAgentState>;

const readAnnotatedFile = tool(
  ({ path }, config) => {
    console.log("================================================");
    console.log("🔍 TOOL CALL: Reading annotated file", path);

    const state = getCurrentTaskInput(config) as CustomAgentState;

    const file = state.files.find((f) => f.path === path);
    if (!file) {
      throw new Error(`File ${path} not found`);
    }

    const annotatedText = file.annotatedText;
    console.log("🔍 TOOL RETURN: ", annotatedText);
    console.log("================================================");
    return annotatedText;
  },
  {
    name: "READ_ANNOTATED_FILE",
    description: "Read the annotated text of a file",
    schema: z.object({
      path: z.string(),
    }),
  }
);

const readAnnotations = tool(
  ({ path }, config) => {
    console.log("================================================");
    console.log("🔍 TOOL CALL: Reading annotations", path);
    const state = getCurrentTaskInput(config) as CustomAgentState;
    const file = state.files.find((f) => f.path === path);
    const annotations = file?.annotations.join("\n");
    console.log("🔍 TOOL RETURN: ", annotations);
    console.log("================================================");
    return annotations;
  },
  {
    name: "READ_ANNOTATIONS",
    description: "Read the annotations of a file",
    schema: z.object({
      path: z.string(),
    }),
  }
);

const readDependencyAnalysis = tool(
  ({ from, to }, config) => {
    console.log("================================================");
    console.log(
      "🔍 TOOL CALL: Reading dependency analysis",
      `${from} -> ${to}`
    );
    const state = getCurrentTaskInput(config) as CustomAgentState;
    const file = state.files.find((f) => f.path === from);
    let analysis =
      file?.dependents.find((d) => d.path === to)?.analysis ||
      file?.dependents.find((d) => d.path === from)?.analysis;
    if (!analysis) {
      const file2 = state.files.find((f) => f.path === to);
      analysis =
        file2?.dependents.find((d) => d.path === from)?.analysis ||
        file2?.dependents.find((d) => d.path === to)?.analysis;
    }
    console.log("🔍 TOOL RETURN: ", analysis);
    console.log("================================================");
    return (
      analysis || "No analysis found. Please use READ_ANNOTATED_FILE  instead."
    );
  },
  {
    name: "READ_DEPENDENCY_ANALYSIS",
    description:
      "Read the dependency analysis between two files from (dependent) to (dependency) to understand the relationship between them",
    schema: z.object({
      from: z.string(),
      to: z.string(),
    }),
  }
);

const readDependents = tool(
  ({ path }, config) => {
    console.log("================================================");
    console.log("🔍 TOOL CALL: Reading dependents", path);
    const state = getCurrentTaskInput(config) as CustomAgentState;
    const dependencies = state.files
      .filter((f) => f.path === path)
      .flatMap((f) => f.dependents)
      .map((d) => `- ${d.path}`);
    console.log("🔍 TOOL RETURN: ", dependencies);
    console.log("================================================");

    const returnText = `The below files are dependent on ${path}:
${[...new Set(dependencies.map((d) => d))].join("\n")}`;

    return returnText;
  },
  {
    name: "READ_DEPENDENTS",
    description:
      "Read the dependents of a file to understand the repository structure and then read dependency analysis",
    schema: z.object({
      path: z.string(),
    }),
  }
);

export const reportAgent = createAgent({
  llm: llmHeavy,
  tools: [
    readAnnotatedFile,
    readAnnotations,
    readDependencyAnalysis,
    readDependents,
  ],
  stateSchema: customAgentState,
  prompt(state, config) {
    const filesWithPaths = state.files.map((f) => `- ${f.path}`).join(",\n");
    const dependencies = state.files
      .flatMap((f) => {
        return f.dependents.map((d) => `- ${f.path} -> ${d.path}`);
      })
      .join(",\n");

    const prompt = PROMPTS.FINAL_REPORT_AGENT_PROMPT.replace(
      "{filesWithPaths}",
      filesWithPaths
    ).replace("{dependencies}", dependencies);

    console.log("================================================");
    console.log("🔍 PROMPT: ", prompt);
    console.log("================================================");

    return [new HumanMessage(prompt), ...state.messages];
  },
});
