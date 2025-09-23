import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import * as z from "zod";
import dotenv from "dotenv";
import fs from "fs";
import { MOCK_EXAMPLE_FILE } from "../../docs/langgraph-generate-tests.constants";
import {
  type AnnotateRequest,
  type AnnotateResponse,
} from "../../shared/schemas.js";

dotenv.config();

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Graph state
const StateAnnotation = Annotation.Root({
  fileName: Annotation<string>,
  text: Annotation<string>,
  annotatedText: Annotation<string>,
  comments: Annotation<string[]>,
});

// Node functions
async function annotateNode(state: typeof StateAnnotation.State) {
  console.log("🔍 Annotation Node - Processing:", state.fileName);

  const prompt = `
@${state.fileName}

Let's make the code easier for you to comprehend:

- Annotate code ONLY with markdown headings, like ## 1. Point Interface for coordinates. Do not add any other text.  

...

## (correct number here). dragNode

### (dragNode's number).1. Calculate delta in screen space 

You get it? 

Here's the code to annotate:

<code>
${state.text}
</code>

Code TOGETHER with annotations:
\`\`\`
`.trimStart();
  const msg = await llm.invoke(prompt);
  return { annotatedText: msg.content };
}

const returnOnlyChangesToFile = (
  originalFile: string,
  changedFile: string
): string[] => {
  const originalLines = originalFile.split("\n");
  const changedLines = changedFile.split("\n");
  const changes: string[] = [];
  for (let i = 0; i < originalLines.length; i++) {
    if (originalLines[i] !== changedLines[i]) {
      changes.push(changedLines[i]);
    }
  }
  return changes.filter(Boolean);
};

const filterComments = (l: string) => !l.startsWith("\n") && l.startsWith("#");

async function logStateNode(state: typeof StateAnnotation.State) {
  const comments = returnOnlyChangesToFile(state.text, state.annotatedText)
    .map((l) => l.trim())
    .filter(filterComments);

  return {
    comments,
  };
}

const annotateWorkflow = new StateGraph(StateAnnotation)
  .addNode("annotate", annotateNode)
  .addNode("logState", logStateNode)
  .addEdge("__start__", "annotate")
  .addEdge("annotate", "logState")
  .addEdge("logState", "__end__")
  .compile();

export async function runAnnotateWorkflow(
  fileName: AnnotateRequest["fileName"],
  text: AnnotateRequest["text"]
): Promise<AnnotateResponse> {
  const state = await annotateWorkflow.invoke({
    fileName,
    text,
  });
  return {
    fileName: state.fileName,
    comments: state.comments,
    annotatedText: state.annotatedText,
  };
}

const res = await runAnnotateWorkflow("example.ts", MOCK_EXAMPLE_FILE);

console.log(res);
