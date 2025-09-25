import { useState, useCallback } from "react";
import {
  type RepoConnection,
  type RepoFile,
  type SelectedRepoFile,
} from "../types/repo";
import { apiPost } from "../utils/api";
import {
  extractImportStatements,
  extractFromPaths,
  filterRelevantImports,
  resolveToFullPaths,
} from "../utils/import-parse.util";

export interface UseRepoConnectionReturn {
  // Connection state
  connection: RepoConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // File listing state
  repoFiles: RepoFile[];
  isLoadingFiles: boolean;
  fileLoadError: string | null;

  // Selected files state
  selectedFiles: SelectedRepoFile[];

  // File content loading state
  loadingFiles: Set<string>;

  // Actions
  connectToRepo: (repoUrl: string, token: string) => Promise<void>;
  disconnect: () => void;
  loadRepoFiles: () => Promise<void>;
  toggleFileSelection: (file: RepoFile) => Promise<void>;
  selectFileWithDependencies: (file: RepoFile) => Promise<void>;
  clearSelectedFiles: () => void;
}

export function useRepoConnection(): UseRepoConnectionReturn {
  const [connection, setConnection] = useState<RepoConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<SelectedRepoFile[]>(
    // MOCK_SELECTED_FILES_2
    []
  );
  // useState<SelectedRepoFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const parseRepoUrl = (url: string) => {
    // Support both HTTPS and SSH GitHub URLs
    const githubHttpsMatch = url.match(
      /https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/
    );
    const githubSshMatch = url.match(
      /git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?/
    );

    if (githubHttpsMatch) {
      return {
        provider: "github" as const,
        owner: githubHttpsMatch[1],
        repo: githubHttpsMatch[2].replace(".git", ""),
      };
    }

    if (githubSshMatch) {
      return {
        provider: "github" as const,
        owner: githubSshMatch[1],
        repo: githubSshMatch[2].replace(".git", ""),
      };
    }

    throw new Error(
      "Unsupported repository URL format. Please use a GitHub HTTPS or SSH URL."
    );
  };

  const connectToRepo = useCallback(async (repoUrl: string, token: string) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const { provider, owner, repo } = parseRepoUrl(repoUrl);

      // Test the connection by making a simple API call
      await apiPost({
        endpoint: "/repo/test-connection",
        body: { provider, owner, repo, token },
      });

      const newConnection: RepoConnection = {
        provider,
        url: repoUrl,
        token,
        owner,
        repo,
      };

      setConnection(newConnection);
      console.log("Successfully connected to repository:", { owner, repo });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to connect to repository";
      setConnectionError(errorMessage);
      console.error("Repository connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnection(null);
    setRepoFiles([]);
    setSelectedFiles([]);
    setLoadingFiles(new Set());
    setConnectionError(null);
    setFileLoadError(null);
  }, []);

  const loadRepoFiles = useCallback(async () => {
    if (!connection) return;

    setIsLoadingFiles(true);
    setFileLoadError(null);

    try {
      const response = await apiPost<typeof connection, RepoFile[]>({
        endpoint: "/repo/list-files",
        body: connection,
      });

      // Filter to only show supported file types
      const supportedExtensions = [".js", ".jsx", ".ts", ".tsx"];
      const filteredFiles = response.filter(
        (file) =>
          file.type === "file" &&
          supportedExtensions.some((ext) =>
            file.path.toLowerCase().endsWith(ext)
          )
      );

      setRepoFiles(filteredFiles);
      console.log("Loaded repository files:", filteredFiles.length);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load repository files";
      setFileLoadError(errorMessage);
      console.error("Failed to load repository files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [connection]);

  const toggleFileSelection = useCallback(
    async (file: RepoFile) => {
      if (!connection) return;

      const isSelected = selectedFiles.some((f) => f.path === file.path);

      if (isSelected) {
        // Remove from selection
        setSelectedFiles((prev) => prev.filter((f) => f.path !== file.path));
      } else {
        // Add to selection - need to fetch file content
        // Set loading state for this file
        setLoadingFiles((prev) => new Set([...prev, file.path]));

        try {
          const response = await apiPost<
            { connection: RepoConnection; filePath: string },
            { content: string }
          >({
            endpoint: "/repo/get-file-content",
            body: { connection, filePath: file.path },
          });

          const selectedFile: SelectedRepoFile = {
            path: file.path,
            name: file.name,
            content: response.content,
            size: file.size || 0,
          };

          setSelectedFiles((prev) => [...prev, selectedFile]);
          console.log("Added file to selection:", file.path);
        } catch (error) {
          console.error("Failed to fetch file content:", error);
        } finally {
          // Remove loading state for this file
          setLoadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(file.path);
            return newSet;
          });
        }
      }
    },
    [connection, selectedFiles]
  );

  const selectFileWithDependencies = useCallback(
    async (file: RepoFile) => {
      if (!connection) return;

      // Keep track of files being processed to avoid circular dependencies
      const processingFiles = new Set<string>();
      const processedFiles = new Set<string>();

      const processFile = async (
        targetFile: RepoFile,
        parentFile?: RepoFile
      ): Promise<void> => {
        // Skip if already selected or being processed
        const isAlreadySelected = selectedFiles.some(
          (f) => f.path === targetFile.path
        );

        if (
          isAlreadySelected ||
          processingFiles.has(targetFile.path) ||
          processedFiles.has(targetFile.path)
        ) {
          // If file is already selected but we have a new parent, update dependents
          if (isAlreadySelected && parentFile) {
            setSelectedFiles((prev) =>
              prev.map((f) => {
                if (f.path === targetFile.path) {
                  const existingDependents = f.dependents || [];
                  // Check if this parent is already in dependents
                  const isParentAlreadyDependent = existingDependents.some(
                    (dep) => dep.path === parentFile.path
                  );

                  if (!isParentAlreadyDependent) {
                    return {
                      ...f,
                      dependents: [
                        ...existingDependents,
                        { name: parentFile.name, path: parentFile.path },
                      ],
                    };
                  }
                }
                return f;
              })
            );
          }
          return;
        }

        // Mark as processing
        processingFiles.add(targetFile.path);

        // Set loading state for this file
        setLoadingFiles((prev) => new Set([...prev, targetFile.path]));

        try {
          // Fetch file content
          const response = await apiPost<
            { connection: RepoConnection; filePath: string },
            { content: string }
          >({
            endpoint: "/repo/get-file-content",
            body: { connection, filePath: targetFile.path },
          });

          processedFiles.add(targetFile.path);

          const selectedFile: SelectedRepoFile = {
            path: targetFile.path,
            name: targetFile.name,
            content: response.content,
            size: targetFile.size || 0,
            // Initialize dependents array with parent if this file has one
            dependents: parentFile
              ? [{ name: parentFile.name, path: parentFile.path }]
              : [],
          };

          // Add to selected files
          setSelectedFiles((prev) => [...prev, selectedFile]);
          console.log("Added file to selection:", targetFile.path);

          // Parse imports and recursively select dependencies
          const imports = extractImportStatements(response.content);
          const fromPaths = extractFromPaths(imports);

          // Create all possible paths from repoFiles for filtering
          const allRepoPaths = repoFiles.map((f) =>
            f.path.split("/").slice(0, -1).join("/")
          );

          // Get the root folder - assume it's the first segment of any file path
          const rootFolder = targetFile.path.split("/")[0];

          const relevantImports = filterRelevantImports(
            fromPaths,
            allRepoPaths,
            rootFolder
          );

          const fullImportPaths = resolveToFullPaths(
            relevantImports,
            targetFile.path,
            rootFolder
          );

          // Find matching files and recursively process them
          for (const importPath of fullImportPaths) {
            // Try to find the file with exact path match first
            let matchingFile = repoFiles.find((f) => f.path === importPath);

            // If not found, try with common extensions
            if (!matchingFile) {
              const extensions = [".ts", ".tsx", ".js", ".jsx"];
              for (const ext of extensions) {
                matchingFile = repoFiles.find(
                  (f) => f.path === `${importPath}${ext}`
                );
                if (matchingFile) break;
              }
            }

            // If still not found, try removing extension and looking for index files
            if (!matchingFile) {
              const indexFiles = [
                "index.ts",
                "index.tsx",
                "index.js",
                "index.jsx",
              ];
              for (const indexFile of indexFiles) {
                matchingFile = repoFiles.find(
                  (f) => f.path === `${importPath}/${indexFile}`
                );
                if (matchingFile) break;
              }
            }

            if (matchingFile) {
              // Pass current file as parent to track dependents
              await processFile(matchingFile, targetFile);
            }
          }
        } catch (error) {
          console.error(
            `Failed to fetch file content for ${targetFile.path}:`,
            error
          );
        } finally {
          // Remove loading state for this file
          setLoadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(targetFile.path);
            return newSet;
          });

          // Remove from processing set
          processingFiles.delete(targetFile.path);
        }
      };

      // Start processing from the root file
      await processFile(file);
    },
    [connection, selectedFiles, repoFiles]
  );

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    // Connection state
    connection,
    isConnected: !!connection,
    isConnecting,
    connectionError,

    // File listing state
    repoFiles,
    isLoadingFiles,
    fileLoadError,

    // Selected files state
    selectedFiles,

    // File content loading state
    loadingFiles,

    // Actions
    connectToRepo,
    disconnect,
    loadRepoFiles,
    toggleFileSelection,
    selectFileWithDependencies,
    clearSelectedFiles,
  };
}
