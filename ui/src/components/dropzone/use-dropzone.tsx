import { useState } from "react";
import { type FileWithPath, type FileRejection } from "@mantine/dropzone";

export function useDropzone() {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);

  const handleDrop = (droppedFiles: FileWithPath[]) => {
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    console.log("Files dropped:", droppedFiles);
  };

  const handleReject = (rejectedFiles: FileRejection[]) => {
    setRejectedFiles((prevRejected) => [...prevRejected, ...rejectedFiles]);
    console.log("Files rejected:", rejectedFiles);
  };

  const handleDelete = (index: number) => {
    setFiles((currentFiles) => {
      const newFiles = [...currentFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
    console.log("File deleted at index:", index);
  };

  const handleUpdate = (files: FileWithPath[]) => {
    setFiles(files);
    console.log("Files updated:", files);
  };

  const handleDeleteRejected = (index: number) => {
    setRejectedFiles((currentRejected) => {
      const newRejected = [...currentRejected];
      newRejected.splice(index, 1);
      return newRejected;
    });
    console.log("Rejected file deleted at index:", index);
  };

  return {
    files,
    rejectedFiles,
    handleDrop,
    handleReject,
    handleDelete,
    handleDeleteRejected,
    handleUpdate,
  };
}
