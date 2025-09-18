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
