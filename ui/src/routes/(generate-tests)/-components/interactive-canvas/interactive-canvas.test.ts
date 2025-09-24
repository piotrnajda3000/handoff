/**
 * Unit tests for InteractiveCanvas action functions
 *
 * These tests demonstrate how the action-based architecture enables
 * clean, predictable unit testing of canvas interactions.
 */

import { describe, it, expect } from "vitest";
import {
  dragCanvas,
  zoom,
  dragNode,
  clickNode,
  type CanvasState,
  MIN_ZOOM,
  MAX_ZOOM,
} from "./interactive-canvas";

describe("Canvas Action Functions", () => {
  describe("dragCanvas", () => {
    it("should update pan based on mouse delta", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 100, y: 50 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = dragCanvas(
        initialState,
        { x: 100, y: 100 }, // start point
        { x: 150, y: 120 } // current point
      );

      expect(result.pan).toEqual({ x: 150, y: 70 }); // +50, +20
      expect(result.zoom).toBe(1); // unchanged
    });

    it("should handle negative deltas", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 100, y: 100 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = dragCanvas(
        initialState,
        { x: 200, y: 200 },
        { x: 150, y: 180 }
      );

      expect(result.pan).toEqual({ x: 50, y: 80 }); // -50, -20
    });
  });

  describe("zoom", () => {
    it("should zoom in correctly", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = zoom(
        initialState,
        { x: 400, y: 300 }, // zoom center
        0.1 // 10% zoom in
      );

      expect(result.zoom).toBeCloseTo(1.1);
    });

    it("should zoom out correctly", () => {
      const initialState: CanvasState = {
        zoom: 2,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = zoom(
        initialState,
        { x: 400, y: 300 },
        -0.1 // 10% zoom out
      );

      expect(result.zoom).toBeCloseTo(1.8);
    });

    it("should respect zoom limits", () => {
      // Test maximum zoom limit
      const maxZoomState: CanvasState = {
        zoom: MAX_ZOOM,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const maxResult = zoom(maxZoomState, { x: 0, y: 0 }, 1); // Try to zoom beyond limit
      expect(maxResult.zoom).toBe(MAX_ZOOM);

      // Test minimum zoom limit
      const minZoomState: CanvasState = {
        zoom: MIN_ZOOM,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const minResult = zoom(minZoomState, { x: 0, y: 0 }, -1); // Try to zoom below limit
      expect(minResult.zoom).toBe(MIN_ZOOM);
    });

    it("should adjust pan to keep zoom point stable", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 100, y: 100 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const zoomPoint = { x: 200, y: 150 };
      const result = zoom(initialState, zoomPoint, 1); // 100% zoom in (2x)

      // Pan should adjust so the zoom point remains visually stable
      // Formula: zoomPoint.x - (zoomPoint.x - state.pan.x) * zoomRatio
      // 200 - (200 - 100) * 2 = 200 - 200 = 0
      expect(result.zoom).toBe(2);
      expect(result.pan.x).toBe(0); // 200 - (200 - 100) * 2 = 0
      expect(result.pan.y).toBe(50); // 150 - (150 - 100) * 2 = 50
    });
  });

  describe("dragNode", () => {
    it("should move node in SVG space with zoom 1", () => {
      const positions = { "node-1": { x: 100, y: 100 } };
      const initialPosition = { x: 100, y: 100 };

      const result = dragNode(
        positions,
        "node-1",
        { x: 0, y: 0 }, // start point
        { x: 50, y: 30 }, // current point
        1, // zoom level
        initialPosition
      );

      expect(result["node-1"]).toEqual({ x: 150, y: 130 }); // +50, +30
    });

    it("should account for zoom level in calculations", () => {
      const positions = { "node-1": { x: 100, y: 100 } };
      const initialPosition = { x: 100, y: 100 };

      const result = dragNode(
        positions,
        "node-1",
        { x: 0, y: 0 },
        { x: 100, y: 60 }, // 100px screen movement
        2, // 2x zoom
        initialPosition
      );

      // Movement in SVG space should be halved due to zoom
      expect(result["node-1"]).toEqual({ x: 150, y: 130 }); // +50, +30 in SVG space
    });

    it("should not affect other nodes", () => {
      const positions = {
        "node-1": { x: 100, y: 100 },
        "node-2": { x: 200, y: 200 },
      };

      const result = dragNode(
        positions,
        "node-1",
        { x: 0, y: 0 },
        { x: 50, y: 30 },
        1,
        { x: 100, y: 100 }
      );

      expect(result["node-1"]).toEqual({ x: 150, y: 130 });
      expect(result["node-2"]).toEqual({ x: 200, y: 200 }); // unchanged
    });
  });

  describe("clickNode", () => {
    it("should select a node when none is selected", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = clickNode(initialState, "node-1");

      expect(result.selectedNodeId).toBe("node-1");
    });

    it("should deselect a node when clicking the selected node", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodeId: "node-1",
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = clickNode(initialState, "node-1");

      expect(result.selectedNodeId).toBeNull();
    });

    it("should switch selection when clicking a different node", () => {
      const initialState: CanvasState = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodeId: "node-1",
        isDragging: false,
        dragType: null,
        draggedNodeId: null,
        dragStartPoint: null,
      };

      const result = clickNode(initialState, "node-2");

      expect(result.selectedNodeId).toBe("node-2");
    });
  });
});

// Integration test examples
describe("Canvas Action Integration", () => {
  it("should handle drag then zoom sequence", () => {
    let state: CanvasState = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedNodeId: null,
      isDragging: false,
      dragType: null,
      draggedNodeId: null,
      dragStartPoint: null,
    };

    // First, drag the canvas
    state = dragCanvas(state, { x: 100, y: 100 }, { x: 150, y: 120 });
    expect(state.pan).toEqual({ x: 50, y: 20 });

    // Then zoom at a specific point
    state = zoom(state, { x: 200, y: 150 }, 0.5); // 50% zoom in

    expect(state.zoom).toBe(1.5);
    // Pan should adjust for the zoom
    // Formula: zoomPoint.x - (zoomPoint.x - state.pan.x) * zoomRatio
    // 200 - (200 - 50) * 1.5 = 200 - 225 = -25
    expect(state.pan.x).toBeCloseTo(-25); // 200 - (200 - 50) * 1.5 = -25
    expect(state.pan.y).toBeCloseTo(-45); // 150 - (150 - 20) * 1.5 = -45
  });

  it("should handle sequential canvas drags correctly", () => {
    let state: CanvasState = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedNodeId: null,
      isDragging: false,
      dragType: null,
      draggedNodeId: null,
      dragStartPoint: null,
    };

    // Simulate a drag sequence as would happen in the component
    // Move 1: from (100, 100) to (110, 105) - delta (10, 5)
    state = dragCanvas(state, { x: 100, y: 100 }, { x: 110, y: 105 });
    expect(state.pan).toEqual({ x: 10, y: 5 });

    // Move 2: from (110, 105) to (125, 115) - delta (15, 10)
    // This simulates updating dragStartPoint to the previous position
    state = dragCanvas(state, { x: 110, y: 105 }, { x: 125, y: 115 });
    expect(state.pan).toEqual({ x: 25, y: 15 }); // 10+15, 5+10

    // Move 3: from (125, 115) to (120, 120) - delta (-5, 5)
    state = dragCanvas(state, { x: 125, y: 115 }, { x: 120, y: 120 });
    expect(state.pan).toEqual({ x: 20, y: 20 }); // 25-5, 15+5

    // Total movement should be (120-100, 120-100) = (20, 20) ✓
  });
});
