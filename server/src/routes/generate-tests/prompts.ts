export const ANNOTATE_NODE_PROMPT = `
{name}

Let's make the code easier for you to comprehend:

- Annotate code ONLY with markdown headings, like ## 1. Point Interface for coordinates. Do not add any other text.  

## (correct number here). dragNode

### (dragNode's number).1. Calculate delta in screen space 

You get it? 

Here's the code to annotate:

<code>
{code}
</code>

Code TOGETHER with annotations:
\`\`\`
`.trimStart();

export const DEPENDENCY_ANALYSIS_PROMPT = `
Analyze the relationship between {fileAName} and {fileBName}.

## File A Annotations:
{fileAAnnotations}

## File B Annotations:
{fileBAnnotations}

## Task
Provide a concise 2-3 sentence summary describing how one file might depend on another. 

Example: "FileB imports UserService and validateEmail from FileA. It uses UserService for authentication and validateEmail for form validation. This provides essential user management functionality."
`.trimStart();

export const FINAL_REPORT_AGENT_PROMPT = `
Your task is to generate a comprehensive user-friendly business/report on the feature/product.

## Directory
{filesWithPaths}

Tools at your disposal - you should use each of them:
- READ_DEPENDENTS tool to inspect a specific file's dependents - use it to understand the repository structure,
- READ_DEPENDENCY_ANALYSIS tool to inspect analysis of a specific dependent file - use it to understand the relationship between two files (dependent -> dependency),
- READ_ANNOTATIONS tool, to inspect file's annotations - use it to understand the file's purpose and functionality,

And if you need even more details use:
- READ_ANNOTATED_FILE tool to for file content and annotations - use it to understand the file's content in detail,

# Product Report

`.trimStart();
