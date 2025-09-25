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
Provide a concise 2-3 sentence summary describing:
- WHAT {fileAName} imports from {fileBName}
- HOW these imports are used
- WHY this dependency exists

Example: "FileA imports UserService and validateEmail from FileB. It uses UserService for authentication and validateEmail for form validation. This provides essential user management functionality."
`.trimStart();

export const FINAL_REPORT_AGENT_PROMPT = `
Your task is to generate a comprehensive report on the feature/product.

## Directory
{filesWithPaths}

## Dependent -> Dependency
{dependencies}

Tools at your disposal:

- READ_ANNOTATIONS tool, to inspect file's annotations,
- READ_ANNOTATED_FILE tool to for more details, 
- READ_DEPENDENCY_ANALYSIS tool to inspect a specific Dependency (right side of the arrow)
`.trimStart();
