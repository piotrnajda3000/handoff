// # 3. File Tree State Management Hook
// Custom hook for managing file tree state and operations

import { useState, useEffect, useMemo } from "react";
import { type RepoFile, type SelectedRepoFile } from "../../../../types/repo";
import { type TreeNode } from "./tree-item";
import { buildFileTree, getFirstLevelDirectories } from "./tree-utils";

// # 3.1 Hook Interface
interface UseFileTreeProps {
  repoFiles: RepoFile[];
  selectedFiles: SelectedRepoFile[];
}

// # 3.2 Hook Return Type
interface UseFileTreeReturn {
  fileTree: TreeNode[];
  expandedDirectories: Set<string>;
  toggleDirectoryExpansion: (path: string) => void;
}

// # 3.3 Main Hook Implementation
// Manages tree state, expansion, and provides utility functions
export function useFileTree({
  repoFiles,
}: UseFileTreeProps): UseFileTreeReturn {
  // # 3.3.1 State Management
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(
    new Set()
  );

  // # 3.3.2 Build Tree Structure
  // Build tree structure from files (memoized to prevent unnecessary re-renders)
  const fileTree = useMemo(() => {
    return repoFiles.length > 0 ? buildFileTree(repoFiles) : [];
  }, [repoFiles]);

  // # 3.3.3 Directory Expansion Functions

  // # 3.3.3.1 Toggle Single Directory
  const toggleDirectoryExpansion = (path: string) => {
    setExpandedDirectories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // # 3.3.4 Auto-expand Effect
  // Auto-expand first level directories when files are first loaded
  useEffect(() => {
    if (repoFiles.length > 0 && expandedDirectories.size === 0) {
      const firstLevelDirs = getFirstLevelDirectories(fileTree);
      setExpandedDirectories(new Set(firstLevelDirs));
    }
  }, [repoFiles.length, fileTree, expandedDirectories.size]);

  // # 3.3.5 Return Hook Interface
  return {
    fileTree,
    expandedDirectories,
    toggleDirectoryExpansion,
  };
}
