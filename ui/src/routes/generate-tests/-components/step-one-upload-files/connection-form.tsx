// # 4. Repository Connection Form Component
// Handles GitHub repository authentication and connection

import {
  Stack,
  Box,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Paper,
  Group,
} from "@mantine/core";
import { IconBrandGithub, IconAlertCircle } from "@tabler/icons-react";

// # 4.1 Component Props Interface
interface ConnectionFormProps {
  repoUrl: string;
  accessToken: string;
  isConnecting: boolean;
  connectionError: string | null;
  onRepoUrlChange: (url: string) => void;
  onAccessTokenChange: (token: string) => void;
  onConnect: () => void;
}

// # 4.2 Main Connection Form Component
// Provides UI for GitHub repository connection with validation and error handling
export function ConnectionForm({
  repoUrl,
  accessToken,
  isConnecting,
  connectionError,
  onRepoUrlChange,
  onAccessTokenChange,
  onConnect,
}: ConnectionFormProps) {
  // # 4.2.1 Form Validation
  const isFormValid = repoUrl.trim() && accessToken.trim();

  return (
    <Stack className="gap-lg">
      {/* # 4.2.2 Header Section */}
      <Box className="text-center">
        <Title order={1} size="h2" className="mb-md">
          Welcome to Handoff
        </Title>
        <Text className="text-gray-600">
          Connect your repository to generate natural language test cases
        </Text>
      </Box>

      {/* # 4.2.3 Connection Form */}
      <Paper className="border-gray-200 rounded-md p-xl">
        <Stack className="gap-md">
          {/* # 4.2.3.1 Form Header */}
          <Group className="gap-xs">
            <IconBrandGithub size={24} />
            <Title order={3} size="h4">
              Connect Your Repository
            </Title>
          </Group>

          {/* # 4.2.3.2 Form Description */}
          <Text size="sm" className="text-gray-600">
            Connect to your GitHub repository (including private repos) to
            select and analyze your code files.
          </Text>

          {/* # 4.2.3.3 Repository URL Input */}
          <TextInput
            label="Repository URL"
            placeholder="https://github.com/username/repository or git@github.com:username/repository.git"
            value={repoUrl}
            onChange={(e) => onRepoUrlChange(e.currentTarget.value)}
            required
          />

          {/* # 4.2.3.4 Access Token Input */}
          <PasswordInput
            label="Personal Access Token"
            placeholder="Your GitHub personal access token"
            description="Create a token at https://github.com/settings/tokens with 'repo' scope for private repositories"
            value={accessToken}
            onChange={(e) => onAccessTokenChange(e.currentTarget.value)}
            required
          />

          {/* # 4.2.3.5 Error Display */}
          {connectionError && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Connection Error"
              color="red"
            >
              {connectionError}
            </Alert>
          )}

          {/* # 4.2.3.6 Connect Button */}
          <Button
            onClick={onConnect}
            loading={isConnecting}
            disabled={!isFormValid}
            leftSection={<IconBrandGithub size="1rem" />}
          >
            {isConnecting ? "Connecting..." : "Connect Repository"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
