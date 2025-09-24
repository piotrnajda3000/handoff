// Import parser utility for automatically discovering and resolving TypeScript/JavaScript imports
import type { RepoFile } from "../types/repo";

export interface ImportStatement {
  importPath: string;
  resolvedPath: string | null;
  isRelative: boolean;
  isNodeModule: boolean;
  fileExists: boolean;
}

export interface ParseImportsResult {
  imports: ImportStatement[];
  validImports: ImportStatement[];
}

/**
 * Parse import statements from TypeScript/JavaScript code
 */
export function parseImportStatements(content: string): string[] {
  return content.split("\n").filter((line) => line.startsWith("import"));
}

/**
 * Resolve a relative import path to an absolute path within the repository
 */
export function resolveImportPath(
  importPath: string,
  currentFilePath: string
): string {
  const fromPart = importPath.split("from")[1].trim().replace(/['"]/g, "");

  console.log({ fromPart });

  const currentDir = currentFilePath.split("/").slice(0, -1).join("/");

  // If it's already an absolute path (starts with '/'), return as is
  if (fromPart.startsWith("/")) {
    return fromPart;
  }

  const levelsUp = importPath.split("/").filter((p) => p === "..").length;

  const levelsUpText = "../".repeat(levelsUp);

  // If it's a relative path, resolve it relative to the current file's directory
  if (fromPart.startsWith("..")) {
    return levelsUpText + currentDir.replace(";", "");
  } else if (fromPart.startsWith("./")) {
    return currentDir + "/" + fromPart.slice(2).replace(";", "");
  }

  // For non-relative imports (like 'react', 'lodash', etc.), return the original path
  // These will be marked as node modules
  return fromPart.replace(";", "");
}

/**
 * Check if an import path refers to a node module
 */
export function isNodeModuleImport(
  importPath: string,
  allRepoFolders: string[]
): boolean {
  // Node module imports don't start with './' or '../' or '/'
  return (
    !importPath.startsWith(".") &&
    !importPath.startsWith("/") &&
    allRepoFolders.includes(importPath)
  ); // Also handle absolute src paths
}

/**
 * Find a matching TypeScript/JavaScript file for an import path
 */
export function findMatchingFile(
  basePath: string,
  repoFiles: RepoFile[]
): RepoFile | null {
  const extensions = [".ts", ".tsx", ".js", ".jsx"];

  if (repoFiles.find((file) => file.path === basePath)) {
    return repoFiles.find((file) => file.path === basePath)!;
  }

  // First, try to find an exact match with the base path
  for (const ext of extensions) {
    const exactPath = basePath + ext;
    const exactFile = repoFiles.find((file) => file.path === exactPath);
    if (exactFile) {
      return exactFile;
    }
  }

  // If the base path already has an extension, try without it
  const baseWithoutExt = basePath.replace(/\.(ts|tsx|js|jsx)$/, "");
  if (baseWithoutExt !== basePath) {
    for (const ext of extensions) {
      const pathWithNewExt = baseWithoutExt + ext;
      const file = repoFiles.find((file) => file.path === pathWithNewExt);
      if (file) {
        return file;
      }
    }
  }

  // Try finding an index file in the directory
  for (const ext of extensions) {
    const indexPath = basePath + "/index" + ext;
    const indexFile = repoFiles.find((file) => file.path === indexPath);
    if (indexFile) {
      return indexFile;
    }
  }

  return null;
}

/**
 * Parse imports from a file's content and resolve them to actual files in the repository
 */
export function parseAndResolveImports(
  fileContent: string,
  currentFilePath: string,
  repoFiles: RepoFile[]
): ParseImportsResult {
  const importPaths = parseImportStatements(fileContent);

  const imports: ImportStatement[] = importPaths.map((importPath) => {
    const isNodeModule = isNodeModuleImport(
      importPath,
      repoFiles.map((file) => file.path)
    );

    const isRelative = importPath.startsWith(".");

    let resolvedPath: string | null = null;
    let fileExists = false;

    if (!isNodeModule) {
      resolvedPath = resolveImportPath(importPath, currentFilePath);

      console.log({ resolvedPath });

      const matchingFile = findMatchingFile(resolvedPath, repoFiles);
      fileExists = !!matchingFile;

      // If we found a matching file, use its exact path
      if (matchingFile) {
        resolvedPath = matchingFile.path;
      }
    }

    return {
      importPath,
      resolvedPath,
      isRelative,
      isNodeModule,
      fileExists,
    };
  });

  // Filter to only valid imports (not node modules and file exists)
  const validImports = imports.filter(
    (imp) => !imp.isNodeModule && imp.fileExists && imp.resolvedPath
  );

  return {
    imports,
    validImports,
  };
}

/**
 * Get all TypeScript/JavaScript files that should be auto-selected based on imports
 */
export function getImportedFilesToSelect(
  fileContent: string,
  currentFilePath: string,
  repoFiles: RepoFile[]
): RepoFile[] {
  const { validImports } = parseAndResolveImports(
    fileContent,
    currentFilePath,
    repoFiles
  );

  const filesToSelect: RepoFile[] = [];

  for (const importStatement of validImports) {
    if (importStatement.resolvedPath) {
      const file = repoFiles.find(
        (f) => f.path === importStatement.resolvedPath
      );
      if (file) {
        filesToSelect.push(file);
      }
    }
  }

  return filesToSelect;
}
