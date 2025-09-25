/* eslint-disable react-refresh/only-export-components */
import { useRef, useState, useMemo, useEffect } from "react";
import { Box } from "@mantine/core";
// Make the canvas work with any file-like object that has a name and optionally a path
interface FileWithName {
  name: string;
  path?: string;
}
import * as d3 from "d3";

// ## 1. Type Definitions and Interfaces
// ### 1.1. Point interface for coordinates
export interface Point {
  x: number;
  y: number;
}

// ### 1.2. Node position interface (SVG coordinate space)
export interface NodePosition {
  x: number;
  y: number;
}

// ### 1.3. File node data interface
interface FileNodeData {
  id: string;
  name: string;
  displayText: string;
  width: number;
  position: NodePosition;
}

// ### 1.4. Edge interface for connections between nodes
export interface Edge {
  id: string;
  from: string;
  to: string;
  description: string;
  analysis?: string; // Analysis text for dependency relationship
}

// ### 1.5. Tooltip state interface
export interface TooltipState {
  visible: boolean;
  type: "node" | "edge" | null;
  nodeId: string | null;
  edgeId: string | null;
  position: Point;
  annotations: string[];
  analysis: string | null;
}

// ### 1.6. Canvas state interface
export interface CanvasState {
  zoom: number;
  pan: Point;
  selectedNodeId: string | null;
  isDragging: boolean;
  dragType: "canvas" | "node" | null;
  draggedNodeId: string | null;
  dragStartPoint: Point | null;
  tooltip: TooltipState;
}

// ### 1.7. Interactive canvas component props
interface InteractiveCanvasProps {
  files: FileWithName[];
  edges?: Edge[];
  annotations?: Record<string, string[]>; // Map file paths to annotations
}

// ## 2. Constants and Configuration
const MIN_NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const NODE_PADDING = 20; // Padding inside the node for text
const GRID_SPACING = 200; // Increased for variable width nodes
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

// ## 2.5. Helper Functions for Text Measurement
function calculateTextWidth(text: string, fontSize: number = 12): number {
  // Create a temporary canvas to measure text width
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return MIN_NODE_WIDTH;

  context.font = `${fontSize}px var(--mantine-font-family, 'Inter', sans-serif)`;
  const metrics = context.measureText(text);
  canvas.remove();

  // Return width plus padding, with minimum width
  return Math.max(MIN_NODE_WIDTH, metrics.width + NODE_PADDING * 2);
}

// ## 3. Canvas Action Functions - Pure functions for testability

// ### 3.1. dragCanvas - Pan the canvas view
export function dragCanvas(
  state: CanvasState,
  startPoint: Point,
  currentPoint: Point
): CanvasState {
  // #### 3.1.1. Calculate movement delta
  const deltaX = currentPoint.x - startPoint.x;
  const deltaY = currentPoint.y - startPoint.y;

  // #### 3.1.2. Return new state with updated pan position
  return {
    ...state,
    pan: {
      x: state.pan.x + deltaX,
      y: state.pan.y + deltaY,
    },
  };
}

// ### 3.2. zoom - Zoom in/out at a specific point
export function zoom(
  state: CanvasState,
  zoomPoint: Point,
  zoomDelta: number
): CanvasState {
  // #### 3.2.1. Calculate new zoom level within bounds
  const newZoom = Math.max(
    MIN_ZOOM,
    Math.min(MAX_ZOOM, state.zoom * (1 + zoomDelta))
  );

  // #### 3.2.2. Early return if zoom didn't change
  if (newZoom === state.zoom) {
    return state;
  }

  // #### 3.2.3. Calculate zoom ratio and adjust pan to zoom at point
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

// ### 3.3. dragNode - Move a specific node
export function dragNode(
  nodePositions: Record<string, NodePosition>,
  nodeId: string,
  startPoint: Point,
  currentPoint: Point,
  canvasZoom: number,
  initialNodePosition: NodePosition
): Record<string, NodePosition> {
  // #### 3.3.1. Calculate delta in screen space
  const screenDeltaX = currentPoint.x - startPoint.x;
  const screenDeltaY = currentPoint.y - startPoint.y;

  // #### 3.3.2. Convert to SVG space (account for zoom)
  const svgDeltaX = screenDeltaX / canvasZoom;
  const svgDeltaY = screenDeltaY / canvasZoom;

  // #### 3.3.3. Return new node positions with updated node
  return {
    ...nodePositions,
    [nodeId]: {
      x: initialNodePosition.x + svgDeltaX,
      y: initialNodePosition.y + svgDeltaY,
    },
  };
}

// ### 3.4. clickNode - Handle node selection/interaction
export function clickNode(state: CanvasState, nodeId: string): CanvasState {
  return {
    ...state,
    selectedNodeId: state.selectedNodeId === nodeId ? null : nodeId,
  };
}

// ### 3.5. toggleNodeTooltip - Show/hide tooltip with annotations for nodes
export function toggleNodeTooltip(
  state: CanvasState,
  nodeId: string,
  position: Point,
  annotations: string[]
): CanvasState {
  const isCurrentlyVisible =
    state.tooltip.visible &&
    state.tooltip.type === "node" &&
    state.tooltip.nodeId === nodeId;

  return {
    ...state,
    tooltip: {
      visible: !isCurrentlyVisible,
      type: isCurrentlyVisible ? null : "node",
      nodeId: isCurrentlyVisible ? null : nodeId,
      edgeId: null,
      position,
      annotations: isCurrentlyVisible ? [] : annotations,
      analysis: null,
    },
  };
}

// ### 3.6. showEdgeTooltip - Show tooltip with analysis for edges
export function showEdgeTooltip(
  state: CanvasState,
  edgeId: string,
  position: Point,
  analysis: string
): CanvasState {
  return {
    ...state,
    tooltip: {
      visible: true,
      type: "edge",
      nodeId: null,
      edgeId,
      position,
      annotations: [],
      analysis,
    },
  };
}

// ### 3.7. hideTooltip - Hide tooltip
export function hideTooltip(state: CanvasState): CanvasState {
  return {
    ...state,
    tooltip: {
      visible: false,
      type: null,
      nodeId: null,
      edgeId: null,
      position: { x: 0, y: 0 },
      annotations: [],
      analysis: null,
    },
  };
}

// ## 4. InteractiveCanvas Component
export function InteractiveCanvas({
  files,
  edges = [],
  annotations = {},
}: InteractiveCanvasProps) {
  // ### 4.1. State Management
  // #### 4.1.1. Canvas state (zoom, pan, selection, dragging, tooltip)
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNodeId: null,
    isDragging: false,
    dragType: null,
    draggedNodeId: null,
    dragStartPoint: null,
    tooltip: {
      visible: false,
      type: null,
      nodeId: null,
      edgeId: null,
      position: { x: 0, y: 0 },
      annotations: [],
      analysis: null,
    },
  });

  // #### 4.1.2. Node positions state
  const [nodePositions, setNodePositions] = useState<
    Record<string, NodePosition>
  >({});

  // ### 4.2. References for D3 Operations
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const initialNodePositionRef = useRef<NodePosition>({ x: 0, y: 0 });

  // #### 4.2.1. State refs for drag callbacks (to avoid stale closures)
  const canvasStateRef = useRef(canvasState);
  const nodePositionsRef = useRef(nodePositions);

  // ### 4.3. Sync Effects - Keep refs in sync with state
  useEffect(() => {
    canvasStateRef.current = canvasState;
  }, [canvasState]);

  useEffect(() => {
    nodePositionsRef.current = nodePositions;
  }, [nodePositions]);

  // ### 4.4. Computed Data
  // #### 4.4.1. Generate file nodes data with positions
  const fileNodes = useMemo((): FileNodeData[] => {
    return files.map((file, index) => {
      const displayText = file.path || file.name;
      const width = calculateTextWidth(displayText);
      return {
        id: `file-${index}`,
        name: file.name,
        displayText,
        width,
        position:
          nodePositions[`file-${index}`] ||
          calculateInitialPosition(index, files.length),
      };
    });
  }, [files, nodePositions]);

  // ### 4.5. Helper Functions
  // #### 4.5.1. Calculate initial grid position for nodes
  function calculateInitialPosition(
    index: number,
    totalFiles: number
  ): NodePosition {
    const nodesPerRow = Math.ceil(Math.sqrt(totalFiles));
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;

    return {
      x: col * GRID_SPACING + MIN_NODE_WIDTH / 2,
      y: row * GRID_SPACING + NODE_HEIGHT / 2,
    };
  }

  // ### 4.6. Initialization Effects
  // #### 4.6.1. Initialize node positions when files change
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

  // ### 4.7. D3 Setup Effects
  // #### 4.7.1. Initialize SVG and setup D3 behaviors (only once)
  useEffect(() => {
    if (!containerRef.current) return;

    const container = d3.select(containerRef.current);

    // ##### 4.7.1.1. Clear any existing content
    container.selectAll("*").remove();

    // ##### 4.7.1.2. Create SVG element
    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("user-select", "none");

    svgRef.current = svg.node();

    // ##### 4.7.1.3. Create main group for zoom/pan transforms
    const g = svg.append("g");
    gRef.current = g.node();

    // ##### 4.7.1.4. Setup grid pattern for visual grid background
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

    // ##### 4.7.1.5. Add grid background rectangle
    g.append("rect")
      .attr("x", -2000)
      .attr("y", -2000)
      .attr("width", 4000)
      .attr("height", 4000)
      .attr("fill", "url(#grid)");

    // ##### 4.7.1.6. Add arrow marker definition for edges
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

    // ##### 4.7.1.7. Setup zoom behavior - apply to SVG, not container
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on("start", (event) => {
        // Hide tooltip when starting canvas interaction
        if (event.sourceEvent?.type === "mousedown") {
          setCanvasState((prev) => hideTooltip(prev));
        }
      })
      .on("zoom", (event) => {
        const transform = event.transform;

        // Update canvas state with new zoom/pan values
        setCanvasState((prev) => ({
          ...prev,
          zoom: transform.k,
          pan: { x: transform.x, y: transform.y },
        }));

        // Apply transform to the main group
        g.attr("transform", transform.toString());
      });

    zoomBehaviorRef.current = zoomBehavior;

    // ##### 4.7.1.8. Apply zoom behavior to SVG element for proper event handling
    svg.call(zoomBehaviorRef.current);

    // ##### 4.7.1.9. Sync initial state with D3 zoom
    const initialTransform = d3.zoomIdentity
      .translate(canvasState.pan.x, canvasState.pan.y)
      .scale(canvasState.zoom);

    svg.call(zoomBehavior.transform, initialTransform);

    // ##### 4.7.1.10. Cleanup function to remove event listeners
    return () => {
      if (zoomBehaviorRef.current) {
        svg.on(".zoom", null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent recreation

  // #### 4.5.2. Calculate edge connection points between nodes
  const calculateEdgePoints = (
    fromNode: FileNodeData,
    toNode: FileNodeData
  ) => {
    const fromPos = fromNode.position;
    const toPos = toNode.position;

    // ##### 4.5.2.1. Calculate direction vector between nodes
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // ##### 4.5.2.2. Handle case where nodes are at same position
    if (distance === 0) {
      return { x1: fromPos.x, y1: fromPos.y, x2: toPos.x, y2: toPos.y };
    }

    // ##### 4.5.2.3. Normalize direction vector to unit vector
    const unitX = dx / distance;
    const unitY = dy / distance;

    // ##### 4.5.2.4. Calculate connection points at node edges using actual node dimensions
    // From node: start from edge in direction of target
    const fromRadius = Math.max(fromNode.width, NODE_HEIGHT) / 2;
    const x1 = fromPos.x + unitX * fromRadius;
    const y1 = fromPos.y + unitY * fromRadius;

    // To node: end at edge from direction of source
    const toRadius = Math.max(toNode.width, NODE_HEIGHT) / 2;
    const x2 = toPos.x - unitX * toRadius;
    const y2 = toPos.y - unitY * toRadius;

    return { x1, y1, x2, y2 };
  };

  // ### 4.8. Rendering Effects
  // #### 4.8.1. Render edges with D3
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);

    // ##### 4.8.1.1. Helper function to get node by ID
    const getNodeById = (nodeId: string): FileNodeData | null => {
      return fileNodes.find((n) => n.id === nodeId) || null;
    };

    // ##### 4.8.1.2. Filter valid edges (both from and to nodes exist)
    const validEdges = edges.filter((edge) => {
      const fromNode = getNodeById(edge.from);
      const toNode = getNodeById(edge.to);
      return fromNode && toNode;
    });

    // ##### 4.8.1.3. Data join for edges using D3 pattern
    const edgeLines = g
      .selectAll<SVGLineElement, Edge>("line.edge")
      .data(validEdges, (d) => d.id);

    // ##### 4.8.1.4. Enter selection for new edges
    const enterEdges = edgeLines
      .enter()
      .append("line")
      .attr("class", "edge")
      .attr("stroke", "var(--mantine-color-gray-6)")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)")
      .attr("opacity", 0.7);

    // ##### 4.8.1.5. Merge enter and update selections
    const allEdges = enterEdges.merge(edgeLines);

    // ##### 4.8.1.5b. Apply click handlers and visual feedback to all edges
    allEdges
      .style("cursor", (d) => (d.analysis ? "pointer" : "default"))
      .attr("stroke-width", (d) => (d.analysis ? 3 : 2))
      .attr("opacity", (d) => (d.analysis ? 0.8 : 0.7))
      .on("click", function (event, d) {
        event.stopPropagation();

        if (!d.analysis) return; // Only show tooltip if analysis exists

        // Get click position for tooltip
        const clickPosition: Point = {
          x: event.clientX,
          y: event.clientY,
        };

        setCanvasState((prev) =>
          showEdgeTooltip(prev, d.id, clickPosition, d.analysis!)
        );
      })
      .on("mouseenter", function (_event, d) {
        if (d.analysis) {
          d3.select(this).attr("stroke", "var(--mantine-color-green-5)");
        }
      })
      .on("mouseleave", function (_event, d) {
        if (d.analysis) {
          d3.select(this).attr("stroke", "var(--mantine-color-gray-6)");
        }
      });

    // ##### 4.8.1.6. Update edge positions with proper node-to-node connections
    allEdges.each(function (d) {
      const fromNode = getNodeById(d.from);
      const toNode = getNodeById(d.to);

      if (fromNode && toNode) {
        const { x1, y1, x2, y2 } = calculateEdgePoints(fromNode, toNode);

        d3.select(this)
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2);
      }
    });

    // ##### 4.8.1.7. Remove edges that are no longer needed
    edgeLines.exit().remove();

    // ##### 4.8.1.8. Data join for edge labels
    const edgeLabels = g
      .selectAll<SVGTextElement, Edge>("text.edge-label")
      .data(validEdges, (d) => d.id);

    // ##### 4.8.1.9. Enter selection for new edge labels
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

    // ##### 4.8.1.10. Merge enter and update selections for labels
    const allLabels = enterLabels.merge(edgeLabels);

    // ##### 4.8.1.11. Update edge label positions and text - position above the line
    allLabels.each(function (d) {
      const fromNode = getNodeById(d.from);
      const toNode = getNodeById(d.to);

      if (fromNode && toNode) {
        const { x1, y1, x2, y2 } = calculateEdgePoints(fromNode, toNode);

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

    // ##### 4.8.1.12. Remove labels that are no longer needed
    edgeLabels.exit().remove();
  }, [edges, fileNodes, nodePositions]);

  // #### 4.8.2. Render nodes with D3
  useEffect(() => {
    if (!gRef.current) return;

    const g = d3.select(gRef.current);

    // ##### 4.8.2.1. Setup drag behavior for nodes
    const dragBehavior = d3
      .drag<SVGGElement, FileNodeData>()
      .on("start", (event, d) => {
        // Prevent canvas zoom/pan while dragging nodes
        event.sourceEvent.stopPropagation();

        // Store initial position for the pure function
        initialNodePositionRef.current = d.position;

        // Store drag start point in screen coordinates
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

        // Get current state from refs to avoid stale closures
        const currentCanvasState = canvasStateRef.current;
        const currentNodePositions = nodePositionsRef.current;

        if (!currentCanvasState.dragStartPoint) return;

        // Get current mouse position in screen coordinates
        const currentPoint: Point = {
          x: event.sourceEvent.clientX,
          y: event.sourceEvent.clientY,
        };

        // Use pure function to calculate new node positions
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
          // Reset state if no drag start point (error case)
          setCanvasState((prev) => ({
            ...prev,
            isDragging: false,
            dragType: null,
            draggedNodeId: null,
            dragStartPoint: null,
          }));
          return;
        }

        // Get end position in screen coordinates
        const endPoint: Point = {
          x: event.sourceEvent.clientX,
          y: event.sourceEvent.clientY,
        };

        // Check if this was a click vs drag (movement threshold)
        const isClick =
          Math.abs(endPoint.x - currentCanvasState.dragStartPoint.x) < 5 &&
          Math.abs(endPoint.y - currentCanvasState.dragStartPoint.y) < 5;

        if (isClick) {
          // Handle click - toggle node selection and show tooltip with annotations
          const clickedFile = files.find(
            (_, index) => `file-${index}` === d.id
          );
          const filePath = clickedFile?.path || clickedFile?.name || "";
          const fileAnnotations = annotations[filePath] || [];

          // Get click position in screen coordinates for tooltip positioning
          const clickPosition: Point = {
            x: endPoint.x,
            y: endPoint.y,
          };

          const newCanvasState = clickNode(currentCanvasState, d.id);
          const tooltipState = toggleNodeTooltip(
            newCanvasState,
            d.id,
            clickPosition,
            fileAnnotations
          );

          setCanvasState({
            ...tooltipState,
            isDragging: false,
            dragType: null,
            draggedNodeId: null,
            dragStartPoint: null,
          });
        } else {
          // Handle drag end - just reset drag state
          setCanvasState((prev) => ({
            ...prev,
            isDragging: false,
            dragType: null,
            draggedNodeId: null,
            dragStartPoint: null,
          }));
        }
      });

    // ##### 4.8.2.2. Data join for nodes using D3 pattern
    const nodeGroups = g
      .selectAll<SVGGElement, FileNodeData>("g.file-node")
      .data(fileNodes, (d) => d.id);

    // ##### 4.8.2.3. Enter selection for new nodes
    const enterGroups = nodeGroups
      .enter()
      .append("g")
      .attr("class", "file-node")
      .style("cursor", "move")
      .call(dragBehavior);

    // ##### 4.8.2.4. Add rectangle shape to new node groups
    enterGroups
      .append("rect")
      .attr("width", (d) => d.width)
      .attr("height", NODE_HEIGHT)
      .attr("rx", 8)
      .attr("x", (d) => -d.width / 2)
      .attr("y", -NODE_HEIGHT / 2);

    // ##### 4.8.2.5. Add text labels to new node groups
    enterGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("font-family", "var(--mantine-font-family)")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) => d.displayText);

    // ##### 4.8.2.6. Merge enter and update selections
    const allGroups = enterGroups.merge(nodeGroups);

    // ##### 4.8.2.7. Update node positions and dimensions
    allGroups.attr(
      "transform",
      (d) => `translate(${d.position.x}, ${d.position.y})`
    );

    // Update rectangle dimensions for all nodes (including existing ones)
    allGroups
      .select("rect")
      .attr("width", (d) => d.width)
      .attr("x", (d) => -d.width / 2);

    // Update text content for all nodes
    allGroups.select("text").text((d) => d.displayText);

    // ##### 4.8.2.8. Update visual states based on selection and drag
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

    // ##### 4.8.2.9. Update text color
    allGroups.select("text").attr("fill", "var(--mantine-color-blue-9)");

    // ##### 4.8.2.10. Setup hover effects for interactive feedback
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

    // ##### 4.8.2.11. Remove nodes that are no longer needed
    nodeGroups.exit().remove();
  }, [fileNodes, canvasState, nodePositions]);

  // ### 4.9. Tooltip Component
  const TooltipComponent = () => {
    if (!canvasState.tooltip.visible || !containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();

    // Position tooltip relative to the container, accounting for scroll
    const tooltipStyle = {
      position: "absolute" as const,
      left: `${canvasState.tooltip.position.x - containerRect.left + 10}px`,
      top: `${canvasState.tooltip.position.y - containerRect.top - 10}px`,
      background: "var(--mantine-color-white)",
      border: "1px solid var(--mantine-color-gray-3)",
      borderRadius: "var(--mantine-radius-md)",
      padding: "12px",
      maxWidth: "350px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      zIndex: 1000,
      fontSize: "12px",
      lineHeight: "1.4",
    };

    const isNodeTooltip = canvasState.tooltip.type === "node";
    const isEdgeTooltip = canvasState.tooltip.type === "edge";

    return (
      <div style={tooltipStyle}>
        {isNodeTooltip && (
          <>
            <div
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--mantine-color-blue-7)",
              }}
            >
              File Annotations
            </div>
            {canvasState.tooltip.annotations.length > 0 ? (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "16px",
                  color: "var(--mantine-color-gray-7)",
                }}
              >
                {canvasState.tooltip.annotations.map((annotation, index) => (
                  <li key={index} style={{ marginBottom: "4px" }}>
                    {annotation}
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  color: "var(--mantine-color-gray-5)",
                  fontStyle: "italic",
                }}
              >
                No annotations available for this file
              </div>
            )}
          </>
        )}

        {isEdgeTooltip && (
          <>
            <div
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--mantine-color-green-7)",
              }}
            >
              Dependency Analysis
            </div>
            <div
              style={{
                color: "var(--mantine-color-gray-7)",
                lineHeight: "1.5",
              }}
            >
              {canvasState.tooltip.analysis}
            </div>
          </>
        )}
      </div>
    );
  };

  // ### 4.10. Component Render - Container for D3 SVG canvas with tooltip
  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: 400,
      }}
    >
      <Box
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid var(--mantine-color-gray-3)",
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          // Dynamic cursor based on interaction state
          cursor: canvasState.isDragging
            ? canvasState.dragType === "canvas"
              ? "grabbing"
              : "move"
            : "grab",
        }}
      />
      <TooltipComponent />
    </Box>
  );
}
