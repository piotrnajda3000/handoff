# Step Two: Describe Relations - Interactive Canvas

## Overview

The second step of the test generation process displays an interactive canvas similar to Blender's shading editor, where each uploaded file is represented as a node. This allows users to visually understand the structure of their codebase and later define relationships between files.

## Features

### Current Implementation

- **Interactive Canvas**: SVG-based canvas with pan, zoom, and drag functionality
- **File Nodes**: Each uploaded file is displayed as a draggable node showing the filename
- **Node Layout**: Automatic initial positioning with grid-based layout
- **Canvas Controls**:
  - **Pan**: Click and drag empty space to pan around the canvas
  - **Zoom**: Mouse wheel to zoom in/out (with center-point zooming)
  - **Node Drag**: Click and drag individual nodes to reposition them
- **Visual Feedback**: Hover states and smooth transitions for better UX

### Future Enhancements (Not Yet Implemented)

- **Directed Arrows**: Ability to connect nodes with arrows to show relationships
- **Node Details**: Expanded node view showing file contents or metadata
- **Relationship Types**: Different arrow types for different kinds of relationships
- **Auto-Layout**: Smart positioning algorithms for better node organization
- **Save/Load**: Persist canvas state and node positions

## Technical Implementation

### Components

- **InteractiveCanvas**: Main canvas component handling SVG rendering and interactions
- **FileNode**: Individual node component representing a file
- **CanvasControls**: Optional control panel for canvas operations

### Architecture

- Uses SVG for scalable, interactive graphics
- React hooks for state management (pan, zoom, node positions)
- Custom drag-and-drop implementation for nodes
- Viewport transformation matrix for pan/zoom operations

### Key Technologies

- React 19.1 with hooks
- SVG for graphics rendering
- Mantine UI components for consistent styling
- TypeScript for type safety

## Canvas Interactions

### Mouse Controls

- **Left Click + Drag on Empty Space**: Pan the canvas
- **Left Click + Drag on Node**: Move the node
- **Mouse Wheel**: Zoom in/out at cursor position
- **Double Click on Node**: Future: Show node details

### Node States

- **Default**: Normal file node appearance
- **Hover**: Highlighted border and subtle scaling
- **Dragging**: Semi-transparent with elevated appearance
- **Selected**: Future: Highlighted for connection operations

## Data Flow

1. Files from step one are passed to the canvas component
2. Canvas generates initial positions for all file nodes
3. User interactions update node positions in real-time
4. Canvas state is maintained for the duration of the step
5. Future: Node relationships will be passed to step three

## Styling

- Consistent with Mantine design system
- Dark/light theme support
- Responsive design for different screen sizes
- Smooth animations and transitions
- Accessibility-friendly colors and contrast

## Performance Considerations

- Efficient SVG rendering for large numbers of files
- Debounced zoom and pan operations
- Virtual viewport for very large canvases
- Optimized re-rendering using React.memo and useMemo
