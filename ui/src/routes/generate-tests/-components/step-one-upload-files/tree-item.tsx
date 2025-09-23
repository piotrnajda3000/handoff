// # 1. Tree Item Component
// This component renders individual nodes in the file tree structure

import React, { useCallback, useMemo } from "react";
import { Checkbox, ActionIcon, Collapse, Loader } from "@mantine/core";
import clsx from "clsx";
import {
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconChevronRight,
  IconChevronDown,
} from "@tabler/icons-react";
import { type RepoFile, type SelectedRepoFile } from "../../../../types/repo";
import styles from "./tree-item.module.css";

// # 1.1 TreeNode Interface
// Represents a single node in the file tree structure
export interface TreeNode {
  path: string;
  name: string;
  type: "file" | "directory";
  file?: RepoFile;
  children: TreeNode[];
  depth: number;
}

// # 1.2 TreeItem Props Interface
interface TreeItemProps {
  node: TreeNode;
  expandedDirectories: Set<string>;
  selectedFiles: SelectedRepoFile[];
  loadingFiles: Set<string>;
  onToggleExpanded: (path: string) => void;
  onToggleSelection: (file: RepoFile) => void;
}

// # 1.3 Main TreeItem Component
// Renders a single tree node with expand/collapse and selection functionality
export const TreeItem = React.memo(function TreeItem({
  node,
  expandedDirectories,
  selectedFiles,
  loadingFiles,
  onToggleExpanded,
  onToggleSelection,
}: TreeItemProps) {
  // # 1.3.1 Node State Calculations
  const hasChildren = node.children.length > 0;
  const isFile = node.type === "file";
  const isExpanded = expandedDirectories.has(node.path);
  const isSelected = node.file
    ? selectedFiles.some((f) => f.path === node.file!.path)
    : false;
  const isLoading = node.file ? loadingFiles.has(node.file.path) : false;

  // # 1.3.2 Click Handler
  // Handles clicks on files (selection) and directories (expand/collapse)
  const handleClick = useCallback(() => {
    if (isFile && node.file && !isLoading) {
      onToggleSelection(node.file);
    } else if (hasChildren) {
      onToggleExpanded(node.path);
    }
  }, [
    isFile,
    node.file,
    node.path,
    isLoading,
    hasChildren,
    onToggleSelection,
    onToggleExpanded,
  ]);

  const paperStyle = useMemo(() => {
    return {
      "--node-depth-margin": `${node.depth * 20}px`,
    } as React.CSSProperties;
  }, [node.depth]);

  return (
    <div>
      {/* # 1.3.3 Node Container */}
      <div
        className={`${styles.nodeContainer} ${
          isFile && isSelected ? styles.selected : ""
        } p-xs rounded-sm shadow-xs border border-gray-200`}
        style={paperStyle}
        onClick={handleClick}
      >
        <div className="flex gap-xs  justify-between">
          {/* # 1.3.4 Left Content Group */}
          <div
            className={`${styles.contentGroup} items-center flex flex-1 gap-xs`}
          >
            {/* # 1.3.4.1 Expansion Controls */}
            {!isFile && hasChildren && (
              <ActionIcon
                variant="transparent"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded(node.path);
                }}
              >
                {isExpanded ? (
                  <IconChevronDown size="0.8rem" />
                ) : (
                  <IconChevronRight size="0.8rem" />
                )}
              </ActionIcon>
            )}
            {!isFile && !hasChildren && (
              <div className="w-5" /> // Spacer for alignment
            )}

            {/* # 1.3.4.2 File Selection Checkbox or Loading Spinner */}
            {isFile ? (
              <div className={`${styles.checkboxContainer} w-5 h-5`}>
                {isLoading ? (
                  <Loader size="xs" />
                ) : (
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}} // Controlled by parent click
                    size="sm"
                  />
                )}
              </div>
            ) : null}

            {/* # 1.3.4.3 Node Icon */}
            {isFile ? (
              <IconFile size="1rem" />
            ) : (
              <>
                {isExpanded ? (
                  <IconFolderOpen size="1rem" />
                ) : (
                  <IconFolder size="1rem" />
                )}
              </>
            )}

            {/* # 1.3.4.4 Node Name */}
            <div className={styles.nodeNameContainer}>
              <p
                className={clsx(
                  isFile ? "font-medium" : "text-gray-600",
                  "text-sm"
                )}
              >
                {node.name}
              </p>
            </div>
          </div>

          {/* # 1.3.5 Right Content - File Size */}
          {isFile && node.file?.size && (
            <p className="text-gray-600 text-xs">
              {Math.round(node.file.size / 1024)}KB
            </p>
          )}
        </div>
      </div>

      {/* # 1.3.6 Children Container */}
      {!isFile && hasChildren && (
        <Collapse in={isExpanded} transitionDuration={0}>
          <div className="mt-xs gap-xs flex flex-col">
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                expandedDirectories={expandedDirectories}
                selectedFiles={selectedFiles}
                loadingFiles={loadingFiles}
                onToggleExpanded={onToggleExpanded}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
});
