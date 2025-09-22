/* eslint-disable react-refresh/only-export-components */
import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import { Box } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";

// Point interface for coordinates
export interface Point {
  x: number;
  y: number;
}

// Node position interface (SVG coordinate space)
export interface NodePosition {
  x: number;
  y: number;
}

interface FileNodeData {
  id: string;
  name: string;
  position: NodePosition;
}

// Canvas state interface
export interface CanvasState {
  zoom: number;
  pan: Point;
  selectedNodeId: string | null;
  isDragging: boolean;
  dragType: "canvas" | "node" | null;
  draggedNodeId: string | null;
  dragStartPoint: Point | null;
}

interface InteractiveCanvasProps {
  files: FileWithPath[];
}

// Constants
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const GRID_SPACING = 180;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;

// Canvas Action Functions - Pure functions for testability
// ========================================================

/**
 * Pan the canvas view
 */
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

/**
 * Zoom in/out at a specific point
 */
export function zoom(
  state: CanvasState,
  zoomPoint: Point,
  zoomDelta: number
): CanvasState {
  const newZoom = Math.max(
    MIN_ZOOM,
    Math.min(MAX_ZOOM, state.zoom * (1 + zoomDelta))
  );

  if (newZoom === state.zoom) {
    return state;
  }

  const zoomRatio = newZoom / state.zoom;

  return {
    ...state,
    zoom: newZoom,
    pan: {
      x: zoomPoint.x - (zoomPoint.x - state.pan.x) * zoomRatio,
      y: zoomPoint.y - (zoomPoint.y - state.pan.y) * zoomRatio,
    },
  };
}

/**
 * Move a specific node
 */
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

  return {
    ...nodePositions,
    [nodeId]: {
      x: initialNodePosition.x + svgDeltaX,
      y: initialNodePosition.y + svgDeltaY,
    },
  };
}

/**
 * Handle node selection/interaction
 */
export function clickNode(state: CanvasState, nodeId: string): CanvasState {
  return {
    ...state,
    selectedNodeId: state.selectedNodeId === nodeId ? null : nodeId,
  };
}

export function InteractiveCanvas({ files }: InteractiveCanvasProps) {
  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNodeId: null,
    isDragging: false,
    dragType: null,
    draggedNodeId: null,
    dragStartPoint: null,
  });

  // Node positions state
  const [nodePositions, setNodePositions] = useState<
    Record<string, NodePosition>
  >({});

  // Refs for drag operations
  const svgRef = useRef<SVGSVGElement>(null);
  const initialNodePositionRef = useRef<NodePosition>({ x: 0, y: 0 });

  // Generate file nodes data
  const fileNodes = useMemo((): FileNodeData[] => {
    return files.map((file, index) => ({
      id: `file-${index}`,
      name: file.name,
      position:
        nodePositions[`file-${index}`] ||
        calculateInitialPosition(index, files.length),
    }));
  }, [files, nodePositions]);

  // Calculate initial grid position for nodes
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

  // Initialize node positions when files change
  useEffect(() => {
    const initialPositions: Record<string, NodePosition> = {};
    files.forEach((_, index) => {
      const nodeId = `file-${index}`;
      if (!nodePositions[nodeId]) {
        initialPositions[nodeId] = calculateInitialPosition(
          index,
          files.length
        );
      }
    });

    if (Object.keys(initialPositions).length > 0) {
      setNodePositions((prev) => ({ ...prev, ...initialPositions }));
    }
  }, [files, nodePositions]);

  // Mouse down handler
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const { clientX, clientY } = event;
      const startPoint: Point = { x: clientX, y: clientY };

      // Check if clicking on a node
      const target = event.target as Element;
      const nodeElement = target.closest("[data-node-id]");

      if (nodeElement) {
        const nodeId = nodeElement.getAttribute("data-node-id")!;
        // Store initial node position for dragging calculation
        initialNodePositionRef.current = nodePositions[nodeId] || {
          x: 0,
          y: 0,
        };

        setCanvasState((prev) => ({
          ...prev,
          isDragging: true,
          dragType: "node",
          draggedNodeId: nodeId,
          dragStartPoint: startPoint,
        }));
      } else {
        setCanvasState((prev) => ({
          ...prev,
          isDragging: true,
          dragType: "canvas",
          dragStartPoint: startPoint,
        }));
      }
    },
    [nodePositions]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!canvasState.isDragging || !canvasState.dragStartPoint) return;

      const { clientX, clientY } = event;
      const currentPoint: Point = { x: clientX, y: clientY };

      if (canvasState.dragType === "canvas") {
        const newCanvasState = dragCanvas(
          canvasState,
          canvasState.dragStartPoint,
          currentPoint
        );
        setCanvasState((prev) => ({
          ...prev,
          pan: newCanvasState.pan,
          dragStartPoint: currentPoint, // Update drag start point for next move
        }));
      } else if (canvasState.dragType === "node" && canvasState.draggedNodeId) {
        const newNodePositions = dragNode(
          nodePositions,
          canvasState.draggedNodeId,
          canvasState.dragStartPoint,
          currentPoint,
          canvasState.zoom,
          initialNodePositionRef.current
        );
        setNodePositions(newNodePositions);
      }
    },
    [canvasState, nodePositions]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (!canvasState.isDragging) return;

      const { clientX, clientY } = event;
      const endPoint: Point = { x: clientX, y: clientY };

      // Check if this was a click vs drag (minimal movement)
      const isClick =
        canvasState.dragStartPoint &&
        Math.abs(endPoint.x - canvasState.dragStartPoint.x) < 5 &&
        Math.abs(endPoint.y - canvasState.dragStartPoint.y) < 5;

      // Handle click on node
      if (
        isClick &&
        canvasState.dragType === "node" &&
        canvasState.draggedNodeId
      ) {
        const newCanvasState = clickNode(
          canvasState,
          canvasState.draggedNodeId
        );
        setCanvasState({
          ...newCanvasState,
          isDragging: false,
          dragType: null,
          draggedNodeId: null,
          dragStartPoint: null,
        });
      } else {
        setCanvasState((prev) => ({
          ...prev,
          isDragging: false,
          dragType: null,
          draggedNodeId: null,
          dragStartPoint: null,
        }));
      }
    },
    [canvasState]
  );

  // Wheel handler for zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();

      const { clientX, clientY } = event;
      const zoomPoint: Point = { x: clientX, y: clientY };
      const zoomDelta = -event.deltaY * ZOOM_SENSITIVITY;

      const newCanvasState = zoom(canvasState, zoomPoint, zoomDelta);

      if (newCanvasState.zoom !== canvasState.zoom) {
        setCanvasState(newCanvasState);
      }
    },
    [canvasState]
  );

  // SVG transform string
  const transform = `translate(${canvasState.pan.x}, ${canvasState.pan.y}) scale(${canvasState.zoom})`;

  return (
    <Box
      style={{
        width: "100%",
        height: 400,
        border: "1px solid var(--mantine-color-gray-3)",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        cursor: canvasState.isDragging
          ? canvasState.dragType === "canvas"
            ? "grabbing"
            : "move"
          : "grab",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ userSelect: "none" }}
      >
        {/* Background pattern */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="var(--mantine-color-gray-2)"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
        </defs>

        <g transform={transform}>
          {/* Grid background */}
          <rect
            x="-2000"
            y="-2000"
            width="4000"
            height="4000"
            fill="url(#grid)"
          />

          {/* Render nodes */}
          {fileNodes.map((node) => (
            <FileNode
              key={node.id}
              id={node.id}
              name={node.name}
              position={node.position}
              isDragging={canvasState.draggedNodeId === node.id}
              isSelected={canvasState.selectedNodeId === node.id}
            />
          ))}
        </g>
      </svg>
    </Box>
  );
}

// File Node Component
interface FileNodeProps {
  id: string;
  name: string;
  position: NodePosition;
  isDragging: boolean;
  isSelected: boolean;
}

function FileNode({
  id,
  name,
  position,
  isDragging,
  isSelected,
}: FileNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const nodeScale = isDragging ? 1.05 : isHovered ? 1.02 : 1;
  const nodeOpacity = isDragging ? 0.8 : 1;

  // Determine colors based on state
  const getFillColor = () => {
    if (isSelected) return "var(--mantine-color-blue-2)";
    return "var(--mantine-color-blue-1)";
  };

  const getStrokeColor = () => {
    if (isSelected) return "var(--mantine-color-blue-6)";
    if (isHovered) return "var(--mantine-color-blue-4)";
    return "var(--mantine-color-blue-3)";
  };

  const getStrokeWidth = () => {
    if (isSelected) return "3";
    if (isHovered) return "2";
    return "1";
  };

  return (
    <g
      data-node-id={id}
      transform={`translate(${position.x - NODE_WIDTH / 2}, ${position.y - NODE_HEIGHT / 2}) scale(${nodeScale})`}
      style={{
        cursor: "move",
        opacity: nodeOpacity,
        transition: isDragging ? "none" : "all 0.2s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node background */}
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx="8"
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
      />

      {/* Node text */}
      <text
        x={NODE_WIDTH / 2}
        y={NODE_HEIGHT / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="var(--mantine-color-blue-9)"
        style={{
          pointerEvents: "none",
          fontFamily: "var(--mantine-font-family)",
          fontWeight: 500,
        }}
      >
        {/* Truncate long filenames */}
        {name.length > 15 ? `${name.substring(0, 12)}...` : name}
      </text>
    </g>
  );
}
