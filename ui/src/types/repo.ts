// Repository connection types
export interface RepoConnection {
  provider: "github" | "gitlab" | "bitbucket";
  url: string;
  token: string;
  owner: string;
  repo: string;
}

export interface RepoFile {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
  content?: string;
  sha?: string;
}

export interface RepoFileTree {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface SelectedRepoFile {
  path: string;
  name: string;
  content: string;
  size: number;
}

// API Response types
export interface GitHubContent {
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

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: RepoFileTree[];
  truncated: boolean;
}
