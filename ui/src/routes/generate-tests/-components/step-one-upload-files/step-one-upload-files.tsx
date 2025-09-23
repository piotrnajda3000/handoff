// # 7. Main Step One Upload Files Component
// Orchestrates the file upload and selection process with repository connection

import { Stack, Box, Title, Text } from "@mantine/core";
import { type UseRepoConnectionReturn } from "../../../../hooks/use-repo-connection";

// # 7.1 Extracted Component Imports
import { ConnectionForm } from "./connection-form";
import { RepositoryHeader } from "./repository-header";
import { FileTreeDisplay } from "./file-tree-display";
import { useFileTree } from "./use-file-tree";

// # 7.2 Component Props Interface
interface StepOneUploadFilesProps {
  repoConnectionData: UseRepoConnectionReturn;
  repoUrl: string;
  setRepoUrl: (repoUrl: string) => void;
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
}

// # 7.3 Main Component Implementation
// Orchestrates the complete file upload and selection workflow
export function StepOneUploadFiles({
  repoConnectionData,
  repoUrl,
  setRepoUrl,
  accessToken,
  setAccessToken,
}: StepOneUploadFilesProps) {
  // # 7.3.2 Repository Connection Data
  const {
    connection,
    isConnected,
    isConnecting,
    connectionError,
    repoFiles,
    isLoadingFiles,
    fileLoadError,
    selectedFiles,
    loadingFiles,
    connectToRepo,
    disconnect,
    loadRepoFiles,
    toggleFileSelection,
  } = repoConnectionData;

  // # 7.3.3 File Tree Management Hook
  const { fileTree, expandedDirectories, toggleDirectoryExpansion } =
    useFileTree({
      repoFiles,
      selectedFiles,
    });

  // # 7.3.4 Event Handlers

  // # 7.3.4.1 Connection Handlers
  const handleConnect = async () => {
    if (!repoUrl.trim() || !accessToken.trim()) {
      return;
    }
    await connectToRepo(repoUrl.trim(), accessToken.trim());
  };

  const handleDisconnect = () => {
    disconnect();
    setRepoUrl("");
    setAccessToken("");
  };

  // # 7.3.4.2 File Management Handlers
  const handleLoadFiles = () => {
    loadRepoFiles();
  };

  // # 7.3.5 Conditional Rendering

  // # 7.3.5.1 Connection Form State
  if (!isConnected) {
    return (
      <ConnectionForm
        repoUrl={repoUrl}
        accessToken={accessToken}
        isConnecting={isConnecting}
        connectionError={connectionError}
        onRepoUrlChange={setRepoUrl}
        onAccessTokenChange={setAccessToken}
        onConnect={handleConnect}
      />
    );
  }

  // # 7.3.5.2 Connected State
  return (
    <Stack gap="lg">
      {/* # 7.3.5.2.1 Page Header */}
      <Box ta="center">
        <Title order={1} size="h2" mb="md">
          Repository Connected
        </Title>
        <Text c="dimmed" size="lg">
          Select the files you want to analyze from {connection?.owner}/
          {connection?.repo}
        </Text>
      </Box>

      {/* # 7.3.5.2.2 Repository Management */}
      <RepositoryHeader
        connection={connection}
        isLoadingFiles={isLoadingFiles}
        onRefresh={handleLoadFiles}
        onDisconnect={handleDisconnect}
      />

      {/* # 7.3.5.2.3 File Tree Display */}
      <FileTreeDisplay
        repoFiles={repoFiles}
        selectedFiles={selectedFiles}
        fileTree={fileTree}
        isLoadingFiles={isLoadingFiles}
        fileLoadError={fileLoadError}
        loadingFiles={loadingFiles}
        expandedDirectories={expandedDirectories}
        onLoadFiles={handleLoadFiles}
        onToggleExpanded={toggleDirectoryExpansion}
        onToggleSelection={toggleFileSelection}
      />
    </Stack>
  );
}
