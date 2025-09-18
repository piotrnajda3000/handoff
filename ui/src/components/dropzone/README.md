# FileDropzone Component

A reusable file upload component built with Mantine that provides a drag-and-drop interface specifically designed for code files (TypeScript and JavaScript).

## Overview

The `FileDropzone` component creates a visually appealing upload area where users can either drag and drop files or click to select them. It includes built-in validation for file types and sizes, visual feedback for different states, and displays selected files with their details.

## Features

- 🎯 **Drag & Drop Support** - Users can drag files directly onto the dropzone
- 📁 **Click to Select** - Alternative file selection via file browser
- ✅ **File Type Validation** - Only accepts TypeScript and JavaScript files
- 📏 **Size Limits** - 5MB maximum file size per file
- 🔄 **Multiple File Support** - Can handle multiple files simultaneously
- 👀 **Visual Feedback** - Different icons and colors for accept/reject/idle states
- 📊 **File Preview** - Shows selected files with names and sizes
- 🎨 **Mantine Integration** - Styled with Mantine design system

## Props

```typescript
interface FileDropzoneProps {
  files: FileWithPath[];
  onDrop: (files: FileWithPath[]) => void;
  onReject: (files: FileRejection[]) => void;
}
```

### `files`

- **Type**: `FileWithPath[]`
- **Description**: Array of currently selected files to display in the preview
- **Required**: Yes

### `onDrop`

- **Type**: `(files: FileWithPath[]) => void`
- **Description**: Callback function called when files are successfully dropped or selected
- **Required**: Yes

### `onReject`

- **Type**: `(files: FileRejection[]) => void`
- **Description**: Callback function called when files are rejected due to validation failures
- **Required**: Yes

## File Restrictions

### Accepted File Types

- TypeScript files: `.ts`, `.tsx`
- JavaScript files: `.js`, `.jsx`

### MIME Types Accepted

- `text/javascript`
- `application/javascript`
- `text/x-javascript`
- `text/typescript`
- `application/typescript`
- `text/x-typescript`

### File Size Limit

- Maximum: 5MB per file

## Usage

### Basic Implementation

```typescript
import { useState } from "react";
import { type FileWithPath, type FileRejection } from "@mantine/dropzone";
import { FileDropzone } from "../components/dropzone/dropzone";

function MyComponent() {
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const handleDrop = (droppedFiles: FileWithPath[]) => {
    setFiles(droppedFiles);
    // Process the files (upload, read, etc.)
  };

  const handleReject = (rejectedFiles: FileRejection[]) => {
    console.log("Files rejected:", rejectedFiles);
    // Handle rejected files (show error message, etc.)
  };

  return (
    <FileDropzone
      files={files}
      onDrop={handleDrop}
      onReject={handleReject}
    />
  );
}
```

### With File Processing

```typescript
const handleDrop = (droppedFiles: FileWithPath[]) => {
  setFiles(droppedFiles);

  // Example: Read file contents
  droppedFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log(`Content of ${file.name}:`, content);
    };
    reader.readAsText(file);
  });
};

const handleReject = (rejectedFiles: FileRejection[]) => {
  rejectedFiles.forEach((rejection) => {
    console.log(`File ${rejection.file.name} rejected:`, rejection.errors);
  });

  // Show user-friendly error messages
  setErrorMessage("Some files were rejected. Please check file type and size.");
};
```

## Visual States

The component displays different visual states based on user interaction:

### Idle State

- 📄 **Icon**: File icon in dimmed color
- **Message**: "Drag files here or click to select"
- **Description**: Shows file type and size requirements

### Accept State (hovering with valid files)

- ⬆️ **Icon**: Upload icon in blue
- **Border**: Highlights to indicate files will be accepted

### Reject State (hovering with invalid files)

- ❌ **Icon**: X icon in red
- **Border**: Shows rejection state for invalid files

## File Preview

When files are selected, the component displays:

- File count header: "Selected files:"
- For each file:
  - 📄 File emoji
  - File name
  - File size in KB (formatted to 1 decimal place)

## Dependencies

This component requires the following packages:

- `@mantine/dropzone` - Core dropzone functionality
- `@mantine/core` - UI components (Box, Text, Group, rem)
- `@tabler/icons-react` - Icons (IconUpload, IconFile, IconX)
- `react` - React hooks (implicit dependency)

## Styling

The component uses Mantine's CSS variables for consistent theming:

- `--mantine-color-gray-4` - Border color
- `--mantine-radius-md` - Border radius
- `--mantine-color-blue-6` - Accept state color
- `--mantine-color-red-6` - Reject state color
- `--mantine-color-dimmed` - Idle state color

## Accessibility

- **Keyboard Navigation**: Supports keyboard interaction through Mantine's built-in accessibility
- **Screen Readers**: Text descriptions provide context for assistive technologies
- **Focus Management**: Proper focus states for keyboard users

## Error Handling

Common rejection scenarios:

- **Invalid file type**: Files that aren't .ts, .tsx, .js, or .jsx
- **File too large**: Files exceeding 5MB limit
- **Read errors**: Files that can't be accessed

Handle rejections in the `onReject` callback to provide user feedback.

## Customization

The component can be extended by:

- Modifying accepted file types in the `accept` array
- Adjusting `maxSize` for different size limits
- Customizing styling through the `style` prop
- Adding additional validation in the callback functions

## Example Integration

See `src/routes/index.tsx` for a complete implementation example in the Handoff application.
