# Interactive Canvas Component Documentation

## Overview

The `InteractiveCanvas` component is a sophisticated React component that provides an interactive, zoomable, and pannable canvas for displaying and manipulating file nodes. Built with D3.js integration, it offers smooth interactions including drag-and-drop functionality, selection highlighting, and grid-based positioning.

## Key Features

- **Zoomable & Pannable Canvas**: Users can zoom in/out and pan around the canvas
- **Draggable File Nodes**: Individual file nodes can be dragged and repositioned
- **Automatic Grid Layout**: Files are automatically arranged in a grid pattern
- **Node Selection**: Click to select/deselect nodes with visual feedback
- **Edge Connections**: Visual connections between nodes with labeled relationships
- **Hover Effects**: Interactive hover states for better UX
- **Grid Background**: Visual grid pattern for spatial reference

## Core Interfaces

### Point Interface

```typescript
export interface Point {
  x: number;
  y: number;
}
```

Represents basic 2D coordinates used throughout the component for mouse positions and calculations.

### Node Position Interface

```typescript
export interface NodePosition {
  x: number;
  y: number;
}
```

Specifically represents node positions in SVG coordinate space.

### Canvas State Interface

```typescript
export interface CanvasState {
  zoom: number;
  pan: Point;
  selectedNodeId: string | null;
  isDragging: boolean;
  dragType: "canvas" | "node" | null;
  draggedNodeId: string | null;
  dragStartPoint: Point | null;
}
```

Manages the complete state of the canvas including zoom level, pan position, selection state, and drag operations.

### File Node Data Interface

```typescript
interface FileNodeData {
  id: string;
  name: string;
  position: NodePosition;
}
```

Represents individual file nodes with their unique identifiers, display names, and positions.

### Edge Interface

```typescript
export interface Edge {
  id: string;
  from: string;
  to: string;
  description: string;
}
```

Represents connections between nodes, where `from` and `to` reference node IDs, and `description` provides the relationship type (e.g., "imports", "uses", "extends").

## Constants

```typescript
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const GRID_SPACING = 180;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;
```

These constants define the visual layout and interaction limits of the canvas.

## Pure Action Functions

The component implements several pure functions for state management, making the logic testable and predictable:

### Canvas Panning

```typescript
export function dragCanvas(
  state: CanvasState,
  startPoint: Point,
  currentPoint: Point
): CanvasState {
  const deltaX = currentPoint.x - startPoint.x;
  const deltaY = currentPoint.y - startPoint.y;

  return {
    ...state,
    pan: {
      x: state.pan.x + deltaX,
      y: state.pan.y + deltaY,
    },
  };
}
```

Handles canvas panning by calculating the delta between start and current mouse positions.

### Zoom Functionality

```typescript
export function zoom(
  state: CanvasState,
  zoomPoint: Point,
  zoomDelta: number
): CanvasState {
  const newZoom = Math.max(
    MIN_ZOOM,
    Math.min(MAX_ZOOM, state.zoom * (1 + zoomDelta))
  );

  // ... zoom-to-point logic
}
```

Implements zoom-to-point functionality, ensuring the zoom stays within defined bounds.

### Node Dragging

```typescript
export function dragNode(
  nodePositions: Record<string, NodePosition>,
  nodeId: string,
  startPoint: Point,
  currentPoint: Point,
  canvasZoom: number,
  initialNodePosition: NodePosition
): Record<string, NodePosition> {
  // Calculate delta in screen space
  const screenDeltaX = currentPoint.x - startPoint.x;
  const screenDeltaY = currentPoint.y - startPoint.y;

  // Convert to SVG space
  const svgDeltaX = screenDeltaX / canvasZoom;
  const svgDeltaY = screenDeltaY / canvasZoom;
  // ...
}
```

Handles node movement with proper coordinate space conversion from screen to SVG coordinates.

## Component Architecture

### State Management

The component uses React hooks for state management:

```typescript
const [canvasState, setCanvasState] = useState<CanvasState>({
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodeId: null,
  isDragging: false,
  dragType: null,
  draggedNodeId: null,
  dragStartPoint: null,
});

const [nodePositions, setNodePositions] = useState<
  Record<string, NodePosition>
>({});
```

### Refs for D3 Integration

```typescript
const containerRef = useRef<HTMLDivElement>(null);
const svgRef = useRef<SVGSVGElement>(null);
const gRef = useRef<SVGGElement>(null);
const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
  null
);
```

These refs provide direct DOM access needed for D3 operations while maintaining React component lifecycle compatibility.

### Automatic Grid Positioning

```typescript
function calculateInitialPosition(
  index: number,
  totalFiles: number
): NodePosition {
  const nodesPerRow = Math.ceil(Math.sqrt(totalFiles));
  const row = Math.floor(index / nodesPerRow);
  const col = index % nodesPerRow;

  return {
    x: col * GRID_SPACING + NODE_WIDTH / 2,
    y: row * GRID_SPACING + NODE_HEIGHT / 2,
  };
}
```

Files are automatically arranged in a square grid pattern, with the grid size calculated based on the total number of files.

## D3.js Integration

### SVG Setup

The component creates a complete SVG structure with zoom/pan capabilities:

```typescript
// Create SVG
const svg = container
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .style("user-select", "none");

// Create main group for zoom/pan transforms
const g = svg.append("g");
```

### Zoom Behavior

```typescript
const zoomBehavior = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([MIN_ZOOM, MAX_ZOOM])
  .on("zoom", (event) => {
    const transform = event.transform;

    setCanvasState((prev) => ({
      ...prev,
      zoom: transform.k,
      pan: { x: transform.x, y: transform.y },
    }));

    g.attr("transform", transform.toString());
  });
```

### Drag Behavior for Nodes

```typescript
const dragBehavior = d3
  .drag<SVGGElement, FileNodeData>()
  .on("start", (event, d) => {
    event.sourceEvent.stopPropagation();
    // Store initial position and start drag state
  })
  .on("drag", (event, d) => {
    // Update node positions during drag
  })
  .on("end", (event, d) => {
    // Handle click vs drag detection
  });
```

## Visual Features

### Grid Background

```typescript
// Setup grid pattern
const pattern = defs
  .append("pattern")
  .attr("id", "grid")
  .attr("width", 20)
  .attr("height", 20)
  .attr("patternUnits", "userSpaceOnUse");

pattern
  .append("path")
  .attr("d", "M 20 0 L 0 0 0 20")
  .attr("fill", "none")
  .attr("stroke", "var(--mantine-color-gray-2)")
  .attr("stroke-width", 0.5);
```

### Edge Connections

The canvas supports visual connections between nodes using SVG lines and arrows:

```typescript
// Arrow marker definition
const arrowMarker = defs
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 8)
  .attr("refY", 0)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto");
```

**Edge Features:**

- **Directional Arrows**: Edges have arrow markers indicating direction
- **Node-to-Node Connections**: Edges connect from the edge of one node to the edge of another (not center-to-center)
- **Labeled Connections**: Each edge displays its relationship description positioned above the line to avoid overlap
- **Dynamic Positioning**: Edges automatically update when nodes are moved
- **Validation**: Only valid edges (where both nodes exist) are rendered

**Edge Styling:**

- **Color**: Gray stroke (`var(--mantine-color-gray-6)`)
- **Width**: 2px stroke width
- **Opacity**: 0.7 for subtle appearance
- **Labels**: Small font (10px) positioned 12px above the edge line using perpendicular offset
- **Connection Points**: Calculated using node radius to ensure clean edge-to-edge connections

### Node Styling

Nodes have different visual states based on interaction:

- **Normal**: Blue background with light border
- **Selected**: Darker blue background with thicker border
- **Hovered**: Enhanced border color
- **Dragging**: Reduced opacity

### Text Truncation

```typescript
.text((d) =>
  d.name.length > 15 ? `${d.name.substring(0, 12)}...` : d.name
);
```

Long file names are automatically truncated with ellipsis for better layout.

## Event Handling

### Click vs Drag Detection

```typescript
const isClick =
  Math.abs(endPoint.x - currentCanvasState.dragStartPoint.x) < 5 &&
  Math.abs(endPoint.y - currentCanvasState.dragStartPoint.y) < 5;

if (isClick) {
  const newCanvasState = clickNode(currentCanvasState, d.id);
  // Handle selection
} else {
  // Handle drag end
}
```

The component differentiates between clicks and drags using a 5-pixel threshold.

### Event Propagation Control

```typescript
event.sourceEvent.stopPropagation();
```

Node drag events are prevented from triggering canvas zoom/pan behavior through careful event propagation management.

## Performance Considerations

- **Ref-based State Access**: Uses refs to access current state in D3 callbacks to avoid stale closure issues
- **Efficient D3 Data Joins**: Uses D3's enter/update/exit pattern for optimal DOM manipulation
- **Pure Functions**: Core logic functions are pure for better testability and performance
- **Selective Re-renders**: Strategic use of `useEffect` dependencies to minimize unnecessary re-renders

## Usage Example

```typescript
import { InteractiveCanvas, Edge } from './interactive-canvas';

function MyComponent() {
  const files = [
    { name: 'file1.ts', path: '/path/to/file1.ts' },
    { name: 'file2.ts', path: '/path/to/file2.ts' },
    { name: 'file3.ts', path: '/path/to/file3.ts' },
    // ... more files
  ];

  const edges: Edge[] = [
    {
      id: 'edge1',
      from: 'file-0', // References file1.ts
      to: 'file-1',   // References file2.ts
      description: 'imports'
    },
    {
      id: 'edge2',
      from: 'file-1', // References file2.ts
      to: 'file-2',   // References file3.ts
      description: 'uses'
    }
  ];

  return (
    <InteractiveCanvas files={files} edges={edges} />
  );
}
```

**Note**: Node IDs follow the pattern `file-{index}` where index corresponds to the file's position in the files array (0-based).

## Testing

The component's pure functions can be easily unit tested:

```typescript
// Example test
const initialState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  // ... other state
};

const result = dragCanvas(initialState, { x: 0, y: 0 }, { x: 10, y: 10 });

expect(result.pan).toEqual({ x: 10, y: 10 });
```

## Dependencies

- **React**: Core functionality and hooks
- **D3.js**: SVG manipulation and interaction behaviors
- **Mantine**: UI framework for consistent styling
- **@mantine/dropzone**: File type definitions

The component successfully bridges React's declarative paradigm with D3's imperative DOM manipulation approach, providing a smooth and responsive user experience for file node interaction.
