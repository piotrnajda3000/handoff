import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Stack,
  Center,
  Title,
  Text,
  Box,
} from "@mantine/core";
import { FileDropzone } from "../components/dropzone/dropzone";
import { useDropzone } from "../components/dropzone/use-dropzone";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
    files,
    rejectedFiles,
    handleDrop,
    handleReject,
    handleDelete,
    handleDeleteRejected,
  } = useDropzone();

  return (
    <Container size="md" style={{ height: "100vh" }}>
      <Center style={{ height: "100%" }}>
        <Paper
          shadow="lg"
          radius="md"
          p="xl"
          style={{ width: "100%", maxWidth: 600 }}
        >
          <Stack gap="lg">
            <Box ta="center">
              <Title order={1} size="h2" mb="md">
                Welcome to Handoff
              </Title>
              <Text c="dimmed" size="lg">
                Upload your code files to generate natural language test cases
              </Text>
            </Box>

            <FileDropzone
              files={files}
              rejectedFiles={rejectedFiles}
              onDrop={handleDrop}
              onReject={handleReject}
              onDelete={handleDelete}
              onDeleteRejected={handleDeleteRejected}
            />
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
