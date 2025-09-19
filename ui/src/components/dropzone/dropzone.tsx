import {
  Dropzone,
  type FileWithPath,
  type FileRejection,
} from "@mantine/dropzone";
import { Box, Text, Group, rem, ActionIcon } from "@mantine/core";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import classes from "./dropzone.module.css";

interface FileDropzoneProps {
  files: FileWithPath[];
  onDrop: (files: FileWithPath[]) => void;
  onReject: (files: FileRejection[]) => void;
  onDelete?: (index: number) => void;
}

export function FileDropzone({
  files,
  onDrop,
  onReject,
  onDelete,
}: FileDropzoneProps) {
  return (
    <>
      <Dropzone
        onDrop={onDrop}
        onReject={onReject}
        maxSize={5 * 1024 ** 2}
        accept={{
          "application/javascript": [".js", ".jsx"],
          "application/typescript": [".ts", ".tsx"],
          "text/*": [".js", ".jsx", ".ts", ".tsx"],
        }}
        multiple
        data-qa="dropzone-container"
        className={classes.root}
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
            <Group
              key={index}
              justify="space-between"
              align="center"
              mb="xs"
              data-qa={`selected-file-${index}`}
            >
              <Text size="sm" c="dimmed">
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Text>
              {onDelete && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete(index)}
                  data-qa={`delete-file-${index}`}
                  aria-label={`Delete ${file.name}`}
                >
                  <IconX size={16} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Box>
      )}
    </>
  );
}
