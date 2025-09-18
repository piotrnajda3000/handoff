import { createFileRoute } from "@tanstack/react-router";
import { type FileWithPath, type FileRejection } from "@mantine/dropzone";
import {
  Container,
  Paper,
  Stack,
  Center,
  Title,
  Text,
  Box,
} from "@mantine/core";
import { useState } from "react";
import { FileDropzone } from "../components/dropzone/dropzone";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const handleDrop = (droppedFiles: FileWithPath[]) => {
    setFiles(droppedFiles);
    console.log("Files dropped:", droppedFiles);
  };

  const handleReject = (rejectedFiles: FileRejection[]) => {
    console.log("Files rejected:", rejectedFiles);
  };

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
              onDrop={handleDrop}
              onReject={handleReject}
            />
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
