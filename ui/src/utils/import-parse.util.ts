// # 1. Import Statement Extraction
// Uses regex patterns to find and extract complete import statements from JavaScript/TypeScript code,
// handling various import syntaxes (named, default, namespace) and quote styles
export function extractImportStatements(content: string): string[] {
  const matches: string[] = [];
  let match;

  // Match import statements with from clauses, handling both single and double quotes
  const simpleImportRegex = /import\s+[^;]+\s+from\s+['"]([^'"]+)['"];?/g;

  while ((match = simpleImportRegex.exec(content)) !== null) {
    // Clean up the match by removing semicolons and normalizing whitespace
    const importStatement = match[0].replace(/;$/, "").trim();
    matches.push(importStatement);
  }

  return matches;
}

// # 2. Path Extraction from Import Statements
// Parses import statements to extract only the module/file paths (the part after "from"),
// returning clean path strings without quotes or import syntax
export function extractFromPaths(imports: string[]): string[] {
  const fromPaths: string[] = [];

  for (const importStatement of imports) {
    // Extract the path from the import statement (the part in quotes after "from")
    const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      fromPaths.push(match[1]);
    }
  }

  return fromPaths;
}

// # 3. Filtering Relevant Imports
// Separates project-internal imports from external package imports by analyzing path patterns,
// ensuring only local dependencies are processed for relationship mapping
export function filterRelevantImports(
  fromPaths: string[],
  allPaths: string[],
  rootFolder: string
): string[] {
  const relevantImports: string[] = [];

  for (const fromPath of fromPaths) {
    // ## 3.1. Relative Import Detection
    // Always include relative imports as they reference files within the project structure
    if (fromPath.startsWith("./") || fromPath.startsWith("../")) {
      relevantImports.push(fromPath);
      continue;
    }

    // ## 3.2. External Package Filtering
    // Skip npm packages by detecting typical external package patterns
    if (!fromPath.includes("/") || fromPath.startsWith("@")) {
      continue; // Skip external packages like 'react' or '@tanstack/react-router'
    }

    // ## 3.3. Project Structure Validation
    // Verify that non-relative imports reference actual directories within the project
    const firstSegment = fromPath.split("/")[0];
    const potentialPath = rootFolder + "/" + firstSegment;

    if (allPaths.includes(potentialPath)) {
      relevantImports.push(fromPath);
    }
  }

  return relevantImports;
}

// # 4. Path Resolution to Absolute Paths
// Converts relative and project-relative import paths into full absolute filesystem paths,
// enabling consistent file relationship mapping across the entire project structure
export function resolveToFullPaths(
  fromPaths: string[],
  filePath: string,
  rootFolder: string
): string[] {
  const fullPaths: string[] = [];

  // Get the directory containing the current file
  const fileDir = filePath.split("/").slice(0, -1).join("/");

  for (const fromPath of fromPaths) {
    let fullPath: string;

    // ## 4.1. Relative Path Resolution
    // Resolve paths starting with ./ or ../ relative to the importing file's directory
    if (fromPath.startsWith("./") || fromPath.startsWith("../")) {
      // Remove the leading ./ if present
      const cleanPath = fromPath.startsWith("./")
        ? fromPath.slice(2)
        : fromPath;
      fullPath = fileDir + "/" + cleanPath;
    } else {
      // ## 4.2. Project-Relative Path Resolution
      // Resolve paths like "src/setup.tsx" relative to the project root directory
      fullPath = rootFolder + "/" + fromPath;
    }

    // Normalize the path to use forward slashes
    fullPath = fullPath.replace(/\\/g, "/");

    fullPaths.push(fullPath);
  }

  return fullPaths;
}
