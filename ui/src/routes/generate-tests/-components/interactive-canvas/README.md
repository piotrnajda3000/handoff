# Interactive Canvas API Design

## Overview

Refactored interactive canvas with clean, testable action-based architecture. Each user interaction triggers a specific action that can be unit tested independently.

## Core Actions

### 1. Canvas Actions

#### `dragCanvas(state, startPoint, currentPoint)`

**Purpose**: Pan the canvas view
**Parameters**:

- `state: CanvasState` - Current canvas state
- `startPoint: Point` - Initial mouse position when drag started
- `currentPoint: Point` - Current mouse position
  **Returns**: `CanvasState` - Updated state with new pan values
  **Behavior**: Calculates delta and updates pan coordinates

#### `zoom(state, zoomPoint, zoomDelta)`

**Purpose**: Zoom in/out at a specific point
**Parameters**:

- `state: CanvasState` - Current canvas state
- `zoomPoint: Point` - Screen coordinates where zoom is centered
- `zoomDelta: number` - Zoom delta (positive = zoom in, negative = zoom out)
  **Returns**: `CanvasState` - Updated state with new zoom and adjusted pan
  **Behavior**: Zooms toward/away from the specified point, keeping it visually stable

### 2. Node Actions

#### `dragNode(nodePositions, nodeId, startPoint, currentPoint, canvasZoom, initialNodePosition)`

**Purpose**: Move a specific node
**Parameters**:

- `nodePositions: Record<string, NodePosition>` - Current node positions
- `nodeId: string` - ID of the node being dragged
- `startPoint: Point` - Initial mouse position when drag started
- `currentPoint: Point` - Current mouse position
- `canvasZoom: number` - Current canvas zoom level
- `initialNodePosition: NodePosition` - Initial position of the node when drag started
  **Returns**: `Record<string, NodePosition>` - Updated node positions
  **Behavior**: Calculates SVG-space delta from initial position and updates node position absolutely

#### `clickNode(state, nodeId)`

**Purpose**: Handle node selection/interaction
**Parameters**:

- `state: CanvasState` - Current canvas state
- `nodeId: string` - ID of the clicked node
  **Returns**: `CanvasState` - Updated state with selection
  **Behavior**: Sets selected node, clears previous selection

## State Management

### CanvasState Interface

```typescript
interface CanvasState {
  zoom: number;
  pan: Point;
  selectedNodeId: string | null;
  isDragging: boolean;
  dragType: "canvas" | "node" | null;
  draggedNodeId: string | null;
  dragStartPoint: Point | null;
}
```

### NodePosition Interface

```typescript
interface NodePosition {
  x: number; // SVG coordinate space
  y: number; // SVG coordinate space
}
```

### Point Interface

```typescript
interface Point {
  x: number; // Screen coordinate space
  y: number; // Screen coordinate space
}
```

## Event Handler Architecture

### Mouse Event Flow

1. **onMouseDown**: Determines action type, captures start point
   - Hit test to determine if clicking node or canvas
   - Set drag state and type
   - Capture initial coordinates

2. **onMouseMove**: Executes appropriate action based on drag type
   - If `dragType === 'canvas'` → call `dragCanvas()`
   - If `dragType === 'node'` → call `dragNode()`
3. **onMouseUp**: Handles click vs drag disambiguation
   - If minimal movement → treat as click
   - If `dragType === 'node'` and was click → call `clickNode()`
   - Reset drag state

4. **onWheel**: Handles zoom
   - Convert wheel delta to zoom delta
   - Call `zoom()` action

### Coordinate Systems

- **Screen Coordinates**: Mouse events, DOM element positions
- **SVG Coordinates**: Internal canvas space (affected by zoom/pan)

### Drag Distance Calculation Fix

The previous implementation had issues with cumulative drag offsets. New approach:

1. Capture initial mouse position when drag starts
2. On each move, calculate delta from start position (not previous position)
3. Apply delta in SVG coordinate space (divided by zoom)
4. Update node position absolutely, not relatively

## Testing Strategy

### Unit Tests for Actions

Each action is pure function → easy to test:

```typescript
describe("Canvas Actions", () => {
  describe("dragCanvas", () => {
    it("should update pan based on mouse delta", () => {
      const state: CanvasState = {
        zoom: 1,
        pan: { x: 100, y: 50 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };
      const result = dragCanvas(state, { x: 100, y: 100 }, { x: 150, y: 120 });
      expect(result.pan).toEqual({ x: 150, y: 70 });
    });
  });

  describe("zoom", () => {
    it("should zoom toward specified point", () => {
      const state: CanvasState = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };
      const result = zoom(state, { x: 400, y: 300 }, 0.1);
      expect(result.zoom).toBeCloseTo(1.1);
    });
  });

  describe("dragNode", () => {
    it("should move node in SVG space", () => {
      const positions = { "node-1": { x: 100, y: 100 } };
      const initialPosition = { x: 100, y: 100 };
      const result = dragNode(
        positions,
        "node-1",
        { x: 0, y: 0 },
        { x: 50, y: 30 },
        1,
        initialPosition
      );
      expect(result["node-1"]).toEqual({ x: 150, y: 130 });
    });
  });
});
```

### Integration Tests

- Mouse event sequences
- Complex interactions (drag then zoom)
- Edge cases (drag outside bounds)

## Benefits

1. **Testability**: Each action is pure function with predictable I/O
2. **Clarity**: Single responsibility per function
3. **Debugging**: Easy to log/replay specific actions
4. **Extensibility**: Easy to add new actions without touching event handlers
5. **Performance**: Actions can be optimized independently
6. **Bug Fixes**: Isolated drag calculation logic easier to fix

## Migration Notes

### Breaking Changes

- Event handlers now use action functions internally
- State structure slightly modified (added `dragStartPoint`)
- Node position updates are absolute rather than relative

### Backwards Compatibility

- Component props remain the same
- Public API unchanged
- Visual behavior identical (but with fixed drag issues)
