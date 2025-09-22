/* eslint-disable react-refresh/only-export-components */
import { useRef, useState, useMemo, useEffect } from "react";
import { Box } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import * as d3 from "d3";

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

// Edge interface for connections between nodes
export interface Edge {
  id: string;
  from: string;
  to: string;
  description: string;
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
  edges?: Edge[];
}

// Constants
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const GRID_SPACING = 180;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

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

export function InteractiveCanvas({
  files,
  edges = [],
}: InteractiveCanvasProps) {
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

  // Refs for D3 operations
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const initialNodePositionRef = useRef<NodePosition>({ x: 0, y: 0 });

  // Refs to store current state for drag callbacks
  const canvasStateRef = useRef(canvasState);
  const nodePositionsRef = useRef(nodePositions);

  // Keep refs in sync with state
  useEffect(() => {
    canvasStateRef.current = canvasState;
  }, [canvasState]);

  useEffect(() => {
    nodePositionsRef.current = nodePositions;
  }, [nodePositions]);

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

  // D3 Setup Effects
  // Initialize SVG and setup D3 behaviors (only once)
  useEffect(() => {
    if (!containerRef.current) return;

    const container = d3.select(containerRef.current);

    // Clear any existing content
    container.selectAll("*").remove();

    // Create SVG
    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("user-select", "none");

    svgRef.current = svg.node();

    // Create main group for zoom/pan transforms
    const g = svg.append("g");
    gRef.current = g.node();

    // Setup grid pattern
    const defs = svg.append("defs");
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
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.5);

    // Add grid background
    g.append("rect")
      .attr("x", -2000)
      .attr("y", -2000)
      .attr("width", 4000)
      .attr("height", 4000)
      .attr("fill", "url(#grid)");

    // Add arrow marker definition for edges
    const arrowMarker = defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto");

    arrowMarker
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "var(--mantine-color-gray-6)");

    // Setup zoom behavior - apply to SVG, not container
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on("zoom", (event) => {
        const transform = event.transform;

        // Update canvas state
        setCanvasState((prev) => ({
          ...prev,
          zoom: transform.k,
          pan: { x: transform.x, y: transform.y },
        }));

        // Apply transform to the main group
        g.attr("transform", transform.toString());
      });

    zoomBehaviorRef.current = zoomBehavior;

    // Apply zoom behavior to SVG element for proper event handling
    svg.call(zoomBehaviorRef.current);

    // Sync initial state with D3 zoom
    const initialTransform = d3.zoomIdentity
      .translate(canvasState.pan.x, canvasState.pan.y)
      .scale(canvasState.zoom);

    svg.call(zoomBehavior.transform, initialTransform);

    // Cleanup function to remove event listeners
    return () => {
      if (zoomBehaviorRef.current) {
        svg.on(".zoom", null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent recreation

  // Helper function to calculate edge connection points
  const calculateEdgePoints = (fromPos: NodePosition, toPos: NodePosition) => {
    // Calculate direction vector
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return { x1: fromPos.x, y1: fromPos.y, x2: toPos.x, y2: toPos.y };
    }

    // Normalize direction vector
    const unitX = dx / distance;
    const unitY = dy / distance;

    // Calculate connection points at node edges
    // From node: start from edge in direction of target
    const fromRadius = Math.max(NODE_WIDTH, NODE_HEIGHT) / 2;
    const x1 = fromPos.x + unitX * fromRadius;
    const y1 = fromPos.y + unitY * fromRadius;

    // To node: end at edge from direction of source
    const toRadius = Math.max(NODE_WIDTH, NODE_HEIGHT) / 2;
    const x2 = toPos.x - unitX * toRadius;
    const y2 = toPos.y - unitY * toRadius;

    return { x1, y1, x2, y2 };
  };

  // Render edges with D3
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);

    // Helper function to get node position by ID
    const getNodePosition = (nodeId: string): NodePosition | null => {
      const node = fileNodes.find((n) => n.id === nodeId);
      return node ? node.position : null;
    };

    // Filter valid edges (both from and to nodes exist)
    const validEdges = edges.filter((edge) => {
      const fromPos = getNodePosition(edge.from);
      const toPos = getNodePosition(edge.to);
      return fromPos && toPos;
    });

    // Data join for edges
    const edgeLines = g
      .selectAll<SVGLineElement, Edge>("line.edge")
      .data(validEdges, (d) => d.id);

    // Enter selection for edges
    const enterEdges = edgeLines
      .enter()
      .append("line")
      .attr("class", "edge")
      .attr("stroke", "var(--mantine-color-gray-6)")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)")
      .attr("opacity", 0.7);

    // Update all edges (enter + existing)
    const allEdges = enterEdges.merge(edgeLines);

    // Update edge positions with proper node-to-node connections
    allEdges.each(function (d) {
      const fromPos = getNodePosition(d.from);
      const toPos = getNodePosition(d.to);

      if (fromPos && toPos) {
        const { x1, y1, x2, y2 } = calculateEdgePoints(fromPos, toPos);

        d3.select(this)
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2);
      }
    });

    // Remove exit selection
    edgeLines.exit().remove();

    // Data join for edge labels
    const edgeLabels = g
      .selectAll<SVGTextElement, Edge>("text.edge-label")
      .data(validEdges, (d) => d.id);

    // Enter selection for edge labels
    const enterLabels = edgeLabels
      .enter()
      .append("text")
      .attr("class", "edge-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("font-family", "var(--mantine-font-family)")
      .style("fill", "var(--mantine-color-gray-7)")
      .style("background", "white")
      .style("pointer-events", "none");

    // Update all edge labels (enter + existing)
    const allLabels = enterLabels.merge(edgeLabels);

    // Update edge label positions and text - position above the line
    allLabels.each(function (d) {
      const fromPos = getNodePosition(d.from);
      const toPos = getNodePosition(d.to);

      if (fromPos && toPos) {
        const { x1, y1, x2, y2 } = calculateEdgePoints(fromPos, toPos);

        // Calculate midpoint of the actual edge line
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Calculate perpendicular offset to position text above the line
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Perpendicular vector (rotated 90 degrees)
          const perpX = -dy / distance;
          const perpY = dx / distance;

          // Offset text above the line
          const offsetDistance = 12; // pixels above the line
          const textX = midX + perpX * offsetDistance;
          const textY = midY + perpY * offsetDistance;

          d3.select(this).attr("x", textX).attr("y", textY).text(d.description);
        }
      }
    });

    // Remove exit selection for labels
    edgeLabels.exit().remove();
  }, [edges, fileNodes, nodePositions]);

  // Render nodes with D3
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);

    // Setup drag behavior for nodes
    const dragBehavior = d3
      .drag<SVGGElement, FileNodeData>()
      .on("start", (event, d) => {
        // Prevent canvas zoom/pan while dragging nodes
        event.sourceEvent.stopPropagation();

        // Store initial position for the pure function
        initialNodePositionRef.current = d.position;

        // Store drag start point
        const startPoint = {
          x: event.sourceEvent.clientX,
          y: event.sourceEvent.clientY,
        };

        setCanvasState((prev) => ({
          ...prev,
          isDragging: true,
          dragType: "node",
          draggedNodeId: d.id,
          dragStartPoint: startPoint,
        }));
      })
      .on("drag", (event, d) => {
        event.sourceEvent.stopPropagation();

        const currentCanvasState = canvasStateRef.current;
        const currentNodePositions = nodePositionsRef.current;

        if (!currentCanvasState.dragStartPoint) return;

        const currentPoint: Point = {
          x: event.sourceEvent.clientX,
          y: event.sourceEvent.clientY,
        };

        const newNodePositions = dragNode(
          currentNodePositions,
          d.id,
          currentCanvasState.dragStartPoint,
          currentPoint,
          currentCanvasState.zoom,
          initialNodePositionRef.current
        );

        setNodePositions(newNodePositions);
      })
      .on("end", (event, d) => {
        event.sourceEvent.stopPropagation();

        const currentCanvasState = canvasStateRef.current;

        if (!currentCanvasState.dragStartPoint) {
          // Just reset state if no drag start point
          setCanvasState((prev) => ({
            ...prev,
            isDragging: false,
            dragType: null,
            draggedNodeId: null,
            dragStartPoint: null,
          }));
          return;
        }

        const endPoint: Point = {
          x: event.sourceEvent.clientX,
          y: event.sourceEvent.clientY,
        };

        // Check if this was a click vs drag
        const isClick =
          Math.abs(endPoint.x - currentCanvasState.dragStartPoint.x) < 5 &&
          Math.abs(endPoint.y - currentCanvasState.dragStartPoint.y) < 5;

        if (isClick) {
          const newCanvasState = clickNode(currentCanvasState, d.id);
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
      });

    // Data join for nodes
    const nodeGroups = g
      .selectAll<SVGGElement, FileNodeData>("g.file-node")
      .data(fileNodes, (d) => d.id);

    // Enter selection
    const enterGroups = nodeGroups
      .enter()
      .append("g")
      .attr("class", "file-node")
      .style("cursor", "move")
      .call(dragBehavior);

    // Add rectangle to enter selection
    enterGroups
      .append("rect")
      .attr("width", NODE_WIDTH)
      .attr("height", NODE_HEIGHT)
      .attr("rx", 8)
      .attr("x", -NODE_WIDTH / 2)
      .attr("y", -NODE_HEIGHT / 2);

    // Add text to enter selection
    enterGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("font-family", "var(--mantine-font-family)")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) =>
        d.name.length > 15 ? `${d.name.substring(0, 12)}...` : d.name
      );

    // Update all groups (enter + existing)
    const allGroups = enterGroups.merge(nodeGroups);

    // Update positions
    allGroups.attr(
      "transform",
      (d) => `translate(${d.position.x}, ${d.position.y})`
    );

    // Update visual states
    allGroups
      .select("rect")
      .attr("fill", (d) => {
        if (canvasState.selectedNodeId === d.id)
          return "var(--mantine-color-blue-2)";
        return "var(--mantine-color-blue-1)";
      })
      .attr("stroke", (d) => {
        if (canvasState.selectedNodeId === d.id)
          return "var(--mantine-color-blue-6)";
        return "var(--mantine-color-blue-3)";
      })
      .attr("stroke-width", (d) => {
        if (canvasState.selectedNodeId === d.id) return 3;
        return 1;
      })
      .style("opacity", (d) => {
        if (canvasState.draggedNodeId === d.id) return 0.8;
        return 1;
      });

    allGroups.select("text").attr("fill", "var(--mantine-color-blue-9)");

    // Setup hover effects
    allGroups
      .on("mouseenter", function (_event, d) {
        if (canvasState.draggedNodeId !== d.id) {
          d3.select(this)
            .select("rect")
            .attr("stroke", "var(--mantine-color-blue-4)")
            .attr("stroke-width", 2);
        }
      })
      .on("mouseleave", function (_event, d) {
        if (canvasState.draggedNodeId !== d.id) {
          const isSelected = canvasState.selectedNodeId === d.id;
          d3.select(this)
            .select("rect")
            .attr(
              "stroke",
              isSelected
                ? "var(--mantine-color-blue-6)"
                : "var(--mantine-color-blue-3)"
            )
            .attr("stroke-width", isSelected ? 3 : 1);
        }
      });

    // Remove exit selection
    nodeGroups.exit().remove();
  }, [fileNodes, canvasState, nodePositions]);

  return (
    <Box
      ref={containerRef}
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
    />
  );
}
