import { Stack, Box, Title, Text } from "@mantine/core";

export function StepThreeViewResults() {
  return (
    <Stack gap="lg">
      <Box ta="center">
        <Title order={2} mb="md">
          Review Results
        </Title>
        <Text c="dimmed" size="lg">
          Review and download your generated test cases
        </Text>
      </Box>
      {/* This will be implemented later */}
      <Text ta="center" c="green">
        Coming soon: Generated test results
      </Text>
    </Stack>
  );
}
