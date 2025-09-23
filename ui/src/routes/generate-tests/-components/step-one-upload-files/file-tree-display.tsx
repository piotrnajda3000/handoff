// # 6. File Tree Display Component
// Handles the display of file tree structure with loading and error states

import React, { useMemo } from "react";
import {
  Box,
  Text,
  Loader,
  Alert,
  Button,
  ScrollArea,
  Stack,
  TextInput,
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
  loadingFiles: Set<string>;
  expandedDirectories: Set<string>;
  featureName: string;
  onLoadFiles: () => void;
  onToggleExpanded: (path: string) => void;
  onToggleSelection: (file: RepoFile) => void;
  onFeatureNameChange: (value: string) => void;
}

// # 6.2 Main File Tree Display Component
// Manages different display states and renders the tree structure
export const FileTreeDisplay = React.memo(function FileTreeDisplay({
  repoFiles,
  selectedFiles,
  fileTree,
  isLoadingFiles,
  fileLoadError,
  loadingFiles,
  expandedDirectories,
  featureName,
  onLoadFiles,
  onToggleExpanded,
  onToggleSelection,
  onFeatureNameChange,
}: FileTreeDisplayProps) {
  // # 6.2.1 Render Tree Function
  // Creates TreeItem components for each root node (memoized to prevent recreation)
  const renderedTree = useMemo(() => {
    return fileTree.map((node) => (
      <TreeItem
        key={node.path}
        node={node}
        expandedDirectories={expandedDirectories}
        selectedFiles={selectedFiles}
        loadingFiles={loadingFiles}
        onToggleExpanded={onToggleExpanded}
        onToggleSelection={onToggleSelection}
      />
    ));
  }, [
    fileTree,
    expandedDirectories,
    selectedFiles,
    loadingFiles,
    onToggleExpanded,
    onToggleSelection,
  ]);

  return (
    <>
      {/* # 6.2.2 Empty State - No Files Loaded */}
      {!repoFiles.length && !isLoadingFiles && !fileLoadError && (
        <Box className="py-xl text-center">
          <Text className="text-gray-600 mb-md" size="sm">
            Click "Load Files" to browse your repository files
          </Text>
          <Button onClick={onLoadFiles} variant="light">
            Load Files
          </Button>
        </Box>
      )}

      {/* # 6.2.3 Loading State */}
      {isLoadingFiles && (
        <Box className="py-xl text-center">
          <Loader size="sm" className="mb-md" />
          <Text size="sm" className="text-gray-600">
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
          className="mb-md"
        >
          {fileLoadError}
        </Alert>
      )}

      {/* # 6.2.5 Files Display */}
      {repoFiles.length > 0 && (
        <div>
          {/* # 6.2.5.0 Feature Name Input */}
          <TextInput
            label="Feature Name"
            description="The feature you are doing the handoff for"
            value={featureName}
            onChange={(event) => onFeatureNameChange(event.currentTarget.value)}
            placeholder="Enter feature name..."
          />

          {/* # 6.2.5.1 File Count Summary */}
          <Text size="sm" className="text-gray-600 mb-md">
            {selectedFiles.length} of {repoFiles.length} files selected • Only
            JavaScript/TypeScript files are shown
          </Text>

          {/* # 6.2.5.2 Scrollable Tree Container */}
          <div className="h-[400px] px-sm overflow-y-auto flex flex-col gap-xs">
            {renderedTree}
          </div>
        </div>
      )}
    </>
  );
});
