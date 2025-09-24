// # 5. Repository Header Component
// Displays connection status and provides repository management controls

import { Paper, Group, Text, Button, ActionIcon, Tooltip } from "@mantine/core";
import { IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import type { RepoConnection } from "src/types/repo";

// # 5.1 Component Props Interface
interface RepositoryHeaderProps {
  connection: RepoConnection | null;
  isLoadingFiles: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
}

// # 5.2 Main Repository Header Component
// Shows connected repository info and provides tree management controls
export function RepositoryHeader({
  connection,
  isLoadingFiles,
  onRefresh,
  onDisconnect,
}: RepositoryHeaderProps) {
  return (
    <Paper className="border-gray-200 rounded-md p-md">
      <Group className="justify-between">
        {/* # 5.2.1 Connection Status */}
        <Group className="gap-xs">
          <IconCheck size="1rem" color="green" />
          <Text size="sm" className="font-medium">
            Connected to {connection?.owner}/{connection?.repo}
          </Text>
        </Group>

        {/* # 5.2.2 Action Controls */}
        <Group className="gap-xs">
          {/* # 5.2.2.2 Refresh Control */}
          <Tooltip label="Refresh file list">
            <ActionIcon
              variant="light"
              onClick={onRefresh}
              loading={isLoadingFiles}
            >
              <IconRefresh size="1rem" />
            </ActionIcon>
          </Tooltip>

          {/* # 5.2.2.3 Disconnect Control */}
          <Button
            size="xs"
            variant="subtle"
            color="red"
            onClick={onDisconnect}
            leftSection={<IconX size="1rem" />}
          >
            Disconnect
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
