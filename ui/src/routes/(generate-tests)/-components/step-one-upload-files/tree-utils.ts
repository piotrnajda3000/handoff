// # 2. Tree Utility Functions
// Contains helper functions for building and managing file tree structures

import type { RepoFile } from "src/types/repo";
import type { TreeNode } from "./tree-item";

// # 2.1 Build File Tree Function
// Converts a flat list of RepoFile objects into a hierarchical tree structure
export function buildFileTree(files: RepoFile[]): TreeNode[] {
  // # 2.1.1 Initialize Tree Structure
  const tree: TreeNode[] = [];
  const pathToNode: Map<string, TreeNode> = new Map();

  // # 2.1.2 Sort Files for Proper Tree Building
  // Sort files by path to ensure proper hierarchical construction
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  // # 2.1.3 Process Each File
  for (const file of sortedFiles) {
    const pathParts = file.path.split("/");
    let currentPath = "";

    // # 2.1.4 Build Path Hierarchy
    // Create directory nodes for each part of the file path
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // # 2.1.5 Create Node if Not Exists
      if (!pathToNode.has(currentPath)) {
        const isFile = i === pathParts.length - 1;
        const node: TreeNode = {
          path: currentPath,
          name: part,
          type: isFile ? "file" : "directory",
          file: isFile ? file : undefined,
          children: [],
          depth: i,
        };

        pathToNode.set(currentPath, node);

        // # 2.1.6 Link to Parent or Root
        if (parentPath && pathToNode.has(parentPath)) {
          pathToNode.get(parentPath)!.children.push(node);
        } else if (i === 0) {
          tree.push(node);
        }
      }
    }
  }

  return tree;
}

// # 2.2 Collect Directory Paths Function
// Recursively collects all directory paths from a tree structure
export function collectDirectoryPaths(nodes: TreeNode[]): Set<string> {
  const allDirectoryPaths = new Set<string>();

  const traverse = (nodeList: TreeNode[]) => {
    nodeList.forEach((node) => {
      if (node.type === "directory") {
        allDirectoryPaths.add(node.path);
        if (node.children.length > 0) {
          traverse(node.children);
        }
      }
    });
  };

  traverse(nodes);
  return allDirectoryPaths;
}

// # 2.3 Get First Level Directories Function
// Extracts only the top-level directory paths from a tree
export function getFirstLevelDirectories(tree: TreeNode[]): string[] {
  return tree
    .filter((node) => node.type === "directory" && node.depth === 0)
    .map((node) => node.path);
}
