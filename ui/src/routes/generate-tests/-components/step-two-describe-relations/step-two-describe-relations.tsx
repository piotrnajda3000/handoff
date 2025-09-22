import { Stack, Box, Title, Text } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { InteractiveCanvas } from "../interactive-canvas/interactive-canvas";

interface StepTwoDescribeRelationsProps {
  files: FileWithPath[];
}

export function StepTwoDescribeRelations({
  files,
}: StepTwoDescribeRelationsProps) {
  return (
    <Stack gap="lg">
      <Box ta="center">
        <Title order={2} mb="md">
          Configure Test Relationships
        </Title>
        <Text c="dimmed" size="lg">
          Visualize your files and configure how they relate to each other
        </Text>
      </Box>

      {files.length > 0 ? (
        <>
          <Text size="sm" c="dimmed" ta="center">
            Drag nodes to organize them. Use mouse wheel to zoom, click and drag
            empty space to pan.
          </Text>
          <InteractiveCanvas files={files} />
        </>
      ) : (
        <Text ta="center" c="orange">
          No files available. Please go back to step 1 and upload some files.
        </Text>
      )}
    </Stack>
  );
}
