import { FileDropzone } from "#components/dropzone/dropzone";
import { Stack, Box, Title, Text } from "@mantine/core";
import { type FileWithPath, type FileRejection } from "@mantine/dropzone";

interface StepOneUploadFilesProps {
  files: FileWithPath[];
  rejectedFiles: FileRejection[];
  onDrop: (acceptedFiles: FileWithPath[]) => void;
  onReject: (rejectedFiles: FileRejection[]) => void;
  onDelete: (index: number) => void;
  onDeleteRejected: (index: number) => void;
}

export function StepOneUploadFiles({
  files,
  rejectedFiles,
  onDrop,
  onReject,
  onDelete,
  onDeleteRejected,
}: StepOneUploadFilesProps) {
  return (
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
        onDrop={onDrop}
        onReject={onReject}
        onDelete={onDelete}
        onDeleteRejected={onDeleteRejected}
      />
    </Stack>
  );
}
