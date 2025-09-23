// # 1. Tree Item Component
// This component renders individual nodes in the file tree structure

import {
  Box,
  Paper,
  Group,
  Text,
  Checkbox,
  ActionIcon,
  Collapse,
  Stack,
} from "@mantine/core";
import {
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconChevronRight,
  IconChevronDown,
} from "@tabler/icons-react";
import { type RepoFile, type SelectedRepoFile } from "../../../../types/repo";

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
  onToggleExpanded: (path: string) => void;
  onToggleSelection: (file: RepoFile) => void;
}

// # 1.3 Main TreeItem Component
// Renders a single tree node with expand/collapse and selection functionality
export function TreeItem({
  node,
  expandedDirectories,
  selectedFiles,
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

  // # 1.3.2 Click Handler
  // Handles clicks on files (selection) and directories (expand/collapse)
  const handleClick = () => {
    if (isFile && node.file) {
      onToggleSelection(node.file);
    } else if (hasChildren) {
      onToggleExpanded(node.path);
    }
  };

  return (
    <Box>
      {/* # 1.3.3 Node Container */}
      <Paper
        withBorder={isFile && isSelected}
        p="xs"
        radius="sm"
        style={{
          cursor: "pointer",
          backgroundColor:
            isFile && isSelected ? "var(--mantine-color-blue-0)" : undefined,
          borderColor:
            isFile && isSelected ? "var(--mantine-color-blue-3)" : undefined,
          marginLeft: node.depth * 20,
        }}
        onClick={handleClick}
      >
        <Group gap="xs" justify="space-between">
          {/* # 1.3.4 Left Content Group */}
          <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
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
              <Box w={22} /> // Spacer for alignment
            )}

            {/* # 1.3.4.2 File Selection Checkbox */}
            {isFile ? (
              <Checkbox
                checked={isSelected}
                onChange={() => {}} // Controlled by parent click
                size="sm"
              />
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
            <Box style={{ minWidth: 0 }}>
              <Text
                size="sm"
                fw={isFile ? 500 : 600}
                truncate
                c={isFile ? undefined : "dimmed"}
              >
                {node.name}
              </Text>
            </Box>
          </Group>

          {/* # 1.3.5 Right Content - File Size */}
          {isFile && node.file?.size && (
            <Text size="xs" c="dimmed">
              {Math.round(node.file.size / 1024)}KB
            </Text>
          )}
        </Group>
      </Paper>

      {/* # 1.3.6 Children Container */}
      {!isFile && hasChildren && (
        <Collapse in={isExpanded}>
          <Stack gap="xs" mt="xs">
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                expandedDirectories={expandedDirectories}
                selectedFiles={selectedFiles}
                onToggleExpanded={onToggleExpanded}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}
