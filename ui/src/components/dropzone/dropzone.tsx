import {
  Dropzone,
  type FileWithPath,
  type FileRejection,
} from "@mantine/dropzone";
import { Box, Text, Group, rem } from "@mantine/core";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";

interface FileDropzoneProps {
  files: FileWithPath[];
  onDrop: (files: FileWithPath[]) => void;
  onReject: (files: FileRejection[]) => void;
}

export function FileDropzone({ files, onDrop, onReject }: FileDropzoneProps) {
  return (
    <>
      <Dropzone
        onDrop={onDrop}
        onReject={onReject}
        maxSize={5 * 1024 ** 2}
        accept={[
          "text/javascript",
          "application/javascript",
          "text/x-javascript",
          "text/typescript",
          "application/typescript",
          "text/x-typescript",
        ]}
        multiple
        data-qa="dropzone-container"
        style={{
          minHeight: rem(220),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed var(--mantine-color-gray-4)",
          borderRadius: "var(--mantine-radius-md)",
          cursor: "pointer",
          transition: "border-color 0.2s ease",
        }}
      >
        <Group
          justify="center"
          gap="xl"
          style={{ minHeight: rem(220), pointerEvents: "none" }}
          data-qa="dropzone-content"
        >
          <Dropzone.Accept>
            <IconUpload
              data-qa="dropzone-accept-icon"
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-blue-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              data-qa="dropzone-reject-icon"
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile
              data-qa="dropzone-idle-icon"
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div data-qa="dropzone-text-content">
            <Text size="xl" inline data-qa="dropzone-title">
              Drag files here or click to select
            </Text>
            <Text
              size="sm"
              c="dimmed"
              inline
              mt={7}
              data-qa="dropzone-file-types"
            >
              Upload TypeScript (.ts, .tsx) or JavaScript (.js, .jsx) files
            </Text>
            <Text
              size="sm"
              c="dimmed"
              inline
              mt={7}
              data-qa="dropzone-size-limit"
            >
              Files should not exceed 5MB
            </Text>
          </div>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <Box data-qa="selected-files-section">
          <Text fw={500} mb="sm" data-qa="selected-files-title">
            Selected files:
          </Text>
          {files.map((file, index) => (
            <Text
              key={index}
              size="sm"
              c="dimmed"
              data-qa={`selected-file-${index}`}
            >
              📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </Text>
          ))}
        </Box>
      )}
    </>
  );
}
