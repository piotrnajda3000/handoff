# Final Report Agent Implementation Plan

## Overview

This document outlines the implementation plan for a Final Report Agent using LangGraph and JavaScript. The agent will generate comprehensive reports on features/products by intelligently analyzing codebases using specialized tools.

## Agent Architecture

### Core Components

1. **State Management**
   - Use `StateGraph` and `Annotation` from LangGraph for state management
   - Track conversation messages, file analysis results, and report generation progress

2. **LLM Integration**
   - ChatAnthropic (Claude) as the primary reasoning engine
   - Bind tools to enable intelligent tool selection and usage
   - Support structured outputs for consistent report formatting

3. **Tool System**
   - Custom tools for codebase analysis and inspection
   - Tool routing logic to determine when to use tools vs. generate final report

## Implementation Plan

### Phase 1: Tool Definition and Setup

#### 1.1 Define Agent Tools

Based on the `FINAL_REPORT_AGENT_PROMPT`, implement three core tools:

```typescript
// Tool schemas using zod
const ReadAnnotatedFileSchema = z.object({
  filePath: z.string().describe("Path to the file to read with annotations"),
});

const ReadAnnotationsSchema = z.object({
  filePath: z.string().describe("Path to the file to inspect annotations for"),
});

const ReadDependentsSchema = z.object({
  filePath: z.string().describe("Path to the file to find dependents for"),
});
```

#### 1.2 Tool Implementation

```typescript
const readAnnotatedFile = tool(
  async ({ filePath }) => {
    // Implementation to read file with annotations
    // Return annotated file content
  },
  {
    name: "READ_ANNOTATED_FILE",
    description:
      "Read a file with its annotations to understand its purpose and functionality",
    schema: ReadAnnotatedFileSchema,
  }
);

const readAnnotations = tool(
  async ({ filePath }) => {
    // Implementation to extract and return just the annotations
    // Return structured annotation data
  },
  {
    name: "READ_ANNOTATIONS",
    description:
      "Extract annotations from a file to understand its documented behavior",
    schema: ReadAnnotationsSchema,
  }
);

const readDependents = tool(
  async ({ filePath }) => {
    // Implementation to find files that depend on the given file
    // Return list of dependent files with relationship descriptions
  },
  {
    name: "READ_DEPENDENTS",
    description:
      "Find files that depend on the current file to understand its impact",
    schema: ReadDependentsSchema,
  }
);
```

### Phase 2: State Management and Graph Structure

#### 2.1 State Annotation

```typescript
const FinalReportAgentState = Annotation.Root({
  // Input data
  filesWithPaths: Annotation<string>,
  dependencies: Annotation<string>,

  // Agent conversation
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  // Analysis results
  fileAnalysisResults: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  // Final report
  finalReport: Annotation<string>,

  // Progress tracking
  analysisComplete: Annotation<boolean>({
    default: () => false,
  }),
});
```

#### 2.2 Agent Nodes

```typescript
// LLM reasoning node
async function agentReasoningNode(state: typeof FinalReportAgentState.State) {
  const systemMessage = new SystemMessage({
    content: FINAL_REPORT_AGENT_PROMPT.replace(
      "{filesWithPaths}",
      state.filesWithPaths || ""
    ).replace("{dependencies}", state.dependencies || ""),
  });

  const result = await llmWithTools.invoke([systemMessage, ...state.messages]);

  return {
    messages: [result],
  };
}

// Tool execution node
const toolNode = new ToolNode([
  readAnnotatedFile,
  readAnnotations,
  readDependents,
]);

// Report generation node
async function generateFinalReportNode(
  state: typeof FinalReportAgentState.State
) {
  const reportPrompt = createReportPrompt(state.fileAnalysisResults);
  const report = await llm.invoke(reportPrompt);

  return {
    finalReport: report.content,
    analysisComplete: true,
  };
}
```

### Phase 3: Graph Construction and Routing Logic

#### 3.1 Conditional Edge Functions

```typescript
// Routing logic to determine next action
function shouldContinueAnalysis(state: typeof FinalReportAgentState.State) {
  const lastMessage = state.messages[state.messages.length - 1];

  // If LLM made tool calls, execute them
  if (lastMessage?.tool_calls?.length) {
    return "toolNode";
  }

  // If analysis seems complete, generate final report
  if (shouldGenerateReport(state)) {
    return "generateReport";
  }

  // Otherwise continue reasoning
  return "continueReasoning";
}

function shouldGenerateReport(
  state: typeof FinalReportAgentState.State
): boolean {
  // Logic to determine if enough analysis has been done
  // Could be based on:
  // - Number of files analyzed
  // - Depth of dependency analysis
  // - Agent's own assessment
  return state.analysisComplete || hasComprehensiveCoverage(state);
}
```

#### 3.2 Graph Assembly

```typescript
const finalReportAgent = new StateGraph(FinalReportAgentState)
  .addNode("agentReasoning", agentReasoningNode)
  .addNode("toolNode", toolNode)
  .addNode("generateReport", generateFinalReportNode)

  // Entry point
  .addEdge("__start__", "agentReasoning")

  // Conditional routing from reasoning
  .addConditionalEdges("agentReasoning", shouldContinueAnalysis, {
    toolNode: "toolNode",
    generateReport: "generateReport",
    continueReasoning: "agentReasoning",
    __end__: "__end__",
  })

  // After tool execution, return to reasoning
  .addEdge("toolNode", "agentReasoning")

  // After report generation, end
  .addEdge("generateReport", "__end__")

  .compile();
```

### Phase 4: Integration and Enhancement

#### 4.1 API Integration

```typescript
// Express.js endpoint
app.post("/api/generate-final-report", async (req, res) => {
  try {
    const { filesWithPaths, dependencies } = req.body;

    const initialState = {
      filesWithPaths,
      dependencies,
      messages: [
        new HumanMessage({
          content: "Generate a comprehensive report on this feature/product.",
        }),
      ],
    };

    const result = await finalReportAgent.invoke(initialState);

    res.json({
      success: true,
      report: result.finalReport,
      analysisResults: result.fileAnalysisResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 4.2 Streaming Support (Optional)

```typescript
// For real-time progress updates
app.post("/api/generate-final-report-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");

  const stream = await finalReportAgent.stream(initialState);

  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  res.end();
});
```

## Testing Strategy

### Unit Tests

- Test individual tools with mock file systems
- Test state transitions and routing logic
- Test report generation with known inputs

### Integration Tests

- Test full agent workflow with sample codebases
- Test error handling and edge cases
- Test performance with large codebases

### End-to-End Tests

- Test API endpoints
- Test streaming functionality
- Test concurrent agent instances

## Success Metrics

1. **Accuracy**: Generated reports accurately reflect codebase structure and relationships
2. **Completeness**: Reports cover all significant files and dependencies
3. **Performance**: Agent completes analysis within acceptable time limits
4. **Reliability**: Consistent behavior across different codebase sizes and structures

## Future Enhancements

1. **Memory Integration**: Add persistent memory for cross-session learning
2. **Custom Tool Creation**: Dynamic tool generation based on codebase patterns
3. **Multi-Agent Collaboration**: Specialized sub-agents for different analysis tasks
4. **Human-in-the-Loop**: Interactive feedback and guidance during analysis
5. **Visual Report Generation**: Diagrams and charts in addition to text reports

## Implementation Timeline

- **Week 1**: Tool definition and basic state management
- **Week 2**: Graph construction and routing logic
- **Week 3**: API integration and testing
- **Week 4**: Performance optimization and documentation

## References

- [LangGraph Workflows and Agents Documentation](https://docs.langchain.com/oss/javascript/langgraph/workflows-agents#agents)
- [LangGraph Tool Implementation Patterns](https://docs.langchain.com/oss/javascript/langgraph/workflows-agents#agents)
- Current project structure in `server/src/routes/generate-tests/`
