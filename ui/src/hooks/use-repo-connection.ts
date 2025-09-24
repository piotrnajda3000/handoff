import { useState, useCallback } from "react";
import {
  type RepoConnection,
  type RepoFile,
  type SelectedRepoFile,
} from "../types/repo";
import { apiPost } from "../utils/api";
import { getImportedFilesToSelect } from "../utils/import-parser.utils";

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
  toggleFileSelection: (
    file: RepoFile,
    autoSelectImports?: boolean
  ) => Promise<void>;
  autoSelectImportedFiles: (file: SelectedRepoFile) => Promise<void>;
  clearSelectedFiles: () => void;
}

export function useRepoConnection(): UseRepoConnectionReturn {
  const [connection, setConnection] = useState<RepoConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<SelectedRepoFile[]>([]);
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

  const selectFileWithoutAutoImports = useCallback(
    async (file: RepoFile) => {
      if (!connection) return null;

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
        return selectedFile;
      } catch (error) {
        console.error("Failed to fetch file content:", error);
        return null;
      } finally {
        // Remove loading state for this file
        setLoadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.path);
          return newSet;
        });
      }
    },
    [connection]
  );

  const autoSelectImportedFiles = useCallback(
    async (file: SelectedRepoFile) => {
      if (!connection) return;

      try {
        // Get imported files that should be auto-selected
        const importedFiles = getImportedFilesToSelect(
          file.content,
          file.path,
          repoFiles
        );

        console.log({
          content: file.content,
          path: file.path,
          repoFiles: repoFiles,
        });

        console.log(
          `Found ${importedFiles.length} imported files for ${file.path}:`,
          importedFiles.map((f) => f.path)
        );

        // Filter out files that are already selected
        const filesToSelect = importedFiles.filter(
          (importedFile) =>
            !selectedFiles.some(
              (selected) => selected.path === importedFile.path
            )
        );

        if (filesToSelect.length === 0) {
          console.log("No new imported files to select");
          return;
        }

        console.log(`Auto-selecting ${filesToSelect.length} imported files...`);

        // Select each imported file (without triggering auto-select recursively)
        for (const importedFile of filesToSelect) {
          await selectFileWithoutAutoImports(importedFile);
        }
      } catch (error) {
        console.error("Failed to auto-select imported files:", error);
      }
    },
    [connection, repoFiles, selectedFiles, selectFileWithoutAutoImports]
  );

  const toggleFileSelection = useCallback(
    async (file: RepoFile, autoSelectImports = true) => {
      if (!connection) return;

      const isSelected = selectedFiles.some((f) => f.path === file.path);

      if (isSelected) {
        // Remove from selection
        setSelectedFiles((prev) => prev.filter((f) => f.path !== file.path));
      } else {
        // Add to selection - need to fetch file content
        const selectedFile = await selectFileWithoutAutoImports(file);

        // Auto-select imported files if requested and file was successfully selected
        if (autoSelectImports && selectedFile) {
          // Use a small delay to ensure state has updated
          setTimeout(() => {
            autoSelectImportedFiles(selectedFile);
          }, 100);
        }
      }
    },
    [
      connection,
      selectedFiles,
      selectFileWithoutAutoImports,
      autoSelectImportedFiles,
    ]
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
    autoSelectImportedFiles,
    clearSelectedFiles,
  };
}
