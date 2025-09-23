// # 6. File Tree Display Component
// Handles the display of file tree structure with loading and error states

import {
  Box,
  Text,
  Loader,
  Alert,
  Button,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { type RepoFile, type SelectedRepoFile } from "../../../../types/repo";
import { TreeItem, type TreeNode } from "./tree-item";

// # 6.1 Component Props Interface
interface FileTreeDisplayProps {
  repoFiles: RepoFile[];
  selectedFiles: SelectedRepoFile[];
  fileTree: TreeNode[];
  isLoadingFiles: boolean;
  fileLoadError: string | null;
  expandedDirectories: Set<string>;
  onLoadFiles: () => void;
  onToggleExpanded: (path: string) => void;
  onToggleSelection: (file: RepoFile) => void;
}

// # 6.2 Main File Tree Display Component
// Manages different display states and renders the tree structure
export function FileTreeDisplay({
  repoFiles,
  selectedFiles,
  fileTree,
  isLoadingFiles,
  fileLoadError,
  expandedDirectories,
  onLoadFiles,
  onToggleExpanded,
  onToggleSelection,
}: FileTreeDisplayProps) {
  // # 6.2.1 Render Tree Function
  // Creates TreeItem components for each root node
  const renderTree = (nodes: TreeNode[]): React.ReactNode => {
    return nodes.map((node) => (
      <TreeItem
        key={node.path}
        node={node}
        expandedDirectories={expandedDirectories}
        selectedFiles={selectedFiles}
        onToggleExpanded={onToggleExpanded}
        onToggleSelection={onToggleSelection}
      />
    ));
  };

  return (
    <>
      {/* # 6.2.2 Empty State - No Files Loaded */}
      {!repoFiles.length && !isLoadingFiles && !fileLoadError && (
        <Box ta="center" py="xl">
          <Text c="dimmed" size="sm" mb="md">
            Click "Load Files" to browse your repository files
          </Text>
          <Button onClick={onLoadFiles} variant="light">
            Load Files
          </Button>
        </Box>
      )}

      {/* # 6.2.3 Loading State */}
      {isLoadingFiles && (
        <Box ta="center" py="xl">
          <Loader size="sm" mb="md" />
          <Text size="sm" c="dimmed">
            Loading repository files...
          </Text>
        </Box>
      )}

      {/* # 6.2.4 Error State */}
      {fileLoadError && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error Loading Files"
          color="red"
          mb="md"
        >
          {fileLoadError}
        </Alert>
      )}

      {/* # 6.2.5 Files Display */}
      {repoFiles.length > 0 && (
        <Box>
          {/* # 6.2.5.1 File Count Summary */}
          <Text size="sm" c="dimmed" mb="md">
            {selectedFiles.length} of {repoFiles.length} files selected • Only
            JavaScript/TypeScript files are shown
          </Text>

          {/* # 6.2.5.2 Scrollable Tree Container */}
          <ScrollArea h={400}>
            <Stack gap="xs">{renderTree(fileTree)}</Stack>
          </ScrollArea>
        </Box>
      )}
    </>
  );
}
