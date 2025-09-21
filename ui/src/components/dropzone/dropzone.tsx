import {
  Dropzone,
  type FileWithPath,
  type FileRejection,
} from "@mantine/dropzone";
import { Box, Text, Group, rem, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconUpload,
  IconFile,
  IconX,
  IconBrandJavascript,
  IconBrandTypescript,
  IconBrandReact,
  IconAlertCircle,
} from "@tabler/icons-react";
import classes from "./dropzone.module.css";

interface FileDropzoneProps {
  files: FileWithPath[];
  rejectedFiles?: FileRejection[];
  onDrop: (files: FileWithPath[]) => void;
  onReject: (files: FileRejection[]) => void;
  onDelete?: (index: number) => void;
  onDeleteRejected?: (index: number) => void;
}

const ALLOWED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

function validateFileType(file: FileWithPath): boolean {
  const extension = "." + file.name.toLowerCase().split(".").pop();
  return ALLOWED_EXTENSIONS.includes(extension);
}

function validateFiles(files: FileWithPath[]): {
  acceptedFiles: FileWithPath[];
  rejectedFiles: FileRejection[];
} {
  const acceptedFiles: FileWithPath[] = [];
  const rejectedFiles: FileRejection[] = [];

  files.forEach((file) => {
    if (validateFileType(file)) {
      acceptedFiles.push(file);
    } else {
      rejectedFiles.push({
        file,
        errors: [
          {
            code: "file-invalid-type",
            message: `File type not allowed. Only .js, .jsx, .ts, .tsx files are accepted.`,
          },
        ],
      });
    }
  });

  return { acceptedFiles, rejectedFiles };
}

function getFileIcon(fileName: string) {
  const extension = fileName.toLowerCase().split(".").pop();

  switch (extension) {
    case "ts":
      return <IconBrandTypescript size={24} style={{ color: "#3178c6" }} />;
    case "tsx":
      return <IconBrandReact size={24} style={{ color: "#61dafb" }} />;
    case "js":
      return <IconBrandJavascript size={24} style={{ color: "#f7df1e" }} />;
    case "jsx":
      return <IconBrandReact size={24} style={{ color: "#61dafb" }} />;
    default:
      return <IconFile size={24} />;
  }
}

export function FileDropzone({
  files,
  rejectedFiles = [],
  onDrop,
  onReject,
  onDelete,
  onDeleteRejected,
}: FileDropzoneProps) {
  const handleDrop = (droppedFiles: FileWithPath[]) => {
    const { acceptedFiles, rejectedFiles } = validateFiles(droppedFiles);

    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
    }

    if (rejectedFiles.length > 0) {
      onReject(rejectedFiles);
    }
  };

  const handleReject = (rejectedFiles: FileRejection[]) => {
    onReject(rejectedFiles);
  };

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
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

      {(files.length > 0 || rejectedFiles.length > 0) && (
        <Box data-qa="selected-files-section" className="flex flex-col gap-xs">
          {files.map((file, index) => (
            <Group
              key={`accepted-${index}`}
              justify="space-between"
              align="center"
              data-qa={`selected-file-${index}`}
            >
              <Group gap="xs" align="center">
                {getFileIcon(file.name)}
                <Text size="sm" c="dimmed">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Text>
              </Group>
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

          {/* Rejected files */}
          {rejectedFiles.map((rejection, index) => (
            <Group
              key={`rejected-${index}`}
              justify="space-between"
              align="center"
              data-qa={`rejected-file-${index}`}
            >
              <Group gap="xs" align="center">
                <Tooltip
                  label={rejection.errors
                    .map((error) => error.message)
                    .join(", ")}
                  withArrow
                  position="top"
                  data-qa={`error-tooltip-${index}`}
                >
                  <IconAlertCircle
                    size={24}
                    style={{ color: "var(--mantine-color-red-6)" }}
                  />
                </Tooltip>
                <Text size="sm" c="red.6">
                  {rejection.file.name} (
                  {(rejection.file.size / 1024).toFixed(1)} KB)
                </Text>
              </Group>
              {onDeleteRejected && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => onDeleteRejected(index)}
                  data-qa={`delete-rejected-file-${index}`}
                  aria-label={`Delete ${rejection.file.name}`}
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
