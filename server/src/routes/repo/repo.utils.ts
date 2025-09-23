import type {
  RepoConnection,
  RepoTestConnectionRequest,
  RepoFile,
  RepoGetFileContentRequest,
} from "../../shared/schemas.js";

interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export class GitHubAPI {
  private baseUrl = "https://api.github.com";

  private async makeRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async testConnection(request: RepoTestConnectionRequest): Promise<void> {
    const { owner, repo, token } = request;

    try {
      // Try to access the repository to test the connection
      await this.makeRequest(`/repos/${owner}/${repo}`, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to connect to repository: ${message}`);
    }
  }

  async listRepositoryFiles(connection: RepoConnection): Promise<RepoFile[]> {
    const { owner, repo, token } = connection;

    try {
      // Get the default branch first
      const repoInfo = await this.makeRequest<{ default_branch: string }>(
        `/repos/${owner}/${repo}`,
        token
      );

      // Get the tree for the default branch
      const treeResponse = await this.makeRequest<GitHubTreeResponse>(
        `/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`,
        token
      );

      // Filter to only include files (blobs) and convert to our format
      const files: RepoFile[] = treeResponse.tree
        .filter((item) => item.type === "blob")
        .map((item) => ({
          path: item.path,
          name: item.path.split("/").pop() || item.path,
          type: "file" as const,
          size: item.size,
          sha: item.sha,
        }));

      return files;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to list repository files: ${message}`);
    }
  }

  async getFileContent(request: RepoGetFileContentRequest): Promise<string> {
    const { connection, filePath } = request;
    const { owner, repo, token } = connection;

    try {
      const content = await this.makeRequest<GitHubContent>(
        `/repos/${owner}/${repo}/contents/${filePath}`,
        token
      );

      if (content.type !== "file") {
        throw new Error("Path does not point to a file");
      }

      if (!content.content) {
        throw new Error("File content not available");
      }

      // GitHub returns content as base64 encoded
      if (content.encoding === "base64") {
        return Buffer.from(content.content, "base64").toString("utf-8");
      }

      return content.content;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get file content: ${message}`);
    }
  }
}

// Factory function to get the appropriate API client based on provider
export function getRepoAPIClient(provider: string) {
  switch (provider) {
    case "github":
      return new GitHubAPI();
    default:
      throw new Error(`Unsupported repository provider: ${provider}`);
  }
}

// Main functions to be used in the routes
export async function testRepoConnection(
  request: RepoTestConnectionRequest
): Promise<void> {
  const apiClient = getRepoAPIClient(request.provider);
  await apiClient.testConnection(request);
}

export async function listRepoFiles(
  connection: RepoConnection
): Promise<RepoFile[]> {
  const apiClient = getRepoAPIClient(connection.provider);
  return apiClient.listRepositoryFiles(connection);
}

export async function getRepoFileContent(
  request: RepoGetFileContentRequest
): Promise<string> {
  const apiClient = getRepoAPIClient(request.connection.provider);
  return apiClient.getFileContent(request);
}
