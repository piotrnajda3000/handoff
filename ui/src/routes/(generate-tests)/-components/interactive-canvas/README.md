# Interactive Canvas - Code Structure

This document serves as a table of contents for the `interactive-canvas.tsx` file structure.

## 1. Type Definitions and Interfaces

### 1.1. Point interface for coordinates

### 1.2. Node position interface (SVG coordinate space)

### 1.3. File node data interface

### 1.4. Edge interface for connections between nodes

### 1.5. Canvas state interface

### 1.6. Interactive canvas component props

## 2. Constants and Configuration

## 3. Canvas Action Functions - Pure functions for testability

### 3.1. dragCanvas - Pan the canvas view

#### 3.1.1. Calculate movement delta

#### 3.1.2. Return new state with updated pan position

### 3.2. zoom - Zoom in/out at a specific point

#### 3.2.1. Calculate new zoom level within bounds

#### 3.2.2. Early return if zoom didn't change

#### 3.2.3. Calculate zoom ratio and adjust pan to zoom at point

### 3.3. dragNode - Move a specific node

#### 3.3.1. Calculate delta in screen space

#### 3.3.2. Convert to SVG space (account for zoom)

#### 3.3.3. Return new node positions with updated node

### 3.4. clickNode - Handle node selection/interaction

## 4. InteractiveCanvas Component

### 4.1. State Management

#### 4.1.1. Canvas state (zoom, pan, selection, dragging)

#### 4.1.2. Node positions state

### 4.2. References for D3 Operations

#### 4.2.1. State refs for drag callbacks (to avoid stale closures)

### 4.3. Sync Effects - Keep refs in sync with state

### 4.4. Computed Data

#### 4.4.1. Generate file nodes data with positions

### 4.5. Helper Functions

#### 4.5.1. Calculate initial grid position for nodes

#### 4.5.2. Calculate edge connection points between nodes

##### 4.5.2.1. Calculate direction vector between nodes

##### 4.5.2.2. Handle case where nodes are at same position

##### 4.5.2.3. Normalize direction vector to unit vector

##### 4.5.2.4. Calculate connection points at node edges

### 4.6. Initialization Effects

#### 4.6.1. Initialize node positions when files change

### 4.7. D3 Setup Effects

#### 4.7.1. Initialize SVG and setup D3 behaviors (only once)

##### 4.7.1.1. Clear any existing content

##### 4.7.1.2. Create SVG element

##### 4.7.1.3. Create main group for zoom/pan transforms

##### 4.7.1.4. Setup grid pattern for visual grid background

##### 4.7.1.5. Add grid background rectangle

##### 4.7.1.6. Add arrow marker definition for edges

##### 4.7.1.7. Setup zoom behavior - apply to SVG, not container

##### 4.7.1.8. Apply zoom behavior to SVG element for proper event handling

##### 4.7.1.9. Sync initial state with D3 zoom

##### 4.7.1.10. Cleanup function to remove event listeners

### 4.8. Rendering Effects

#### 4.8.1. Render edges with D3

##### 4.8.1.1. Helper function to get node position by ID

##### 4.8.1.2. Filter valid edges (both from and to nodes exist)

##### 4.8.1.3. Data join for edges using D3 pattern

##### 4.8.1.4. Enter selection for new edges

##### 4.8.1.5. Merge enter and update selections

##### 4.8.1.6. Update edge positions with proper node-to-node connections

##### 4.8.1.7. Remove edges that are no longer needed

##### 4.8.1.8. Data join for edge labels

##### 4.8.1.9. Enter selection for new edge labels

##### 4.8.1.10. Merge enter and update selections for labels

##### 4.8.1.11. Update edge label positions and text - position above the line

##### 4.8.1.12. Remove labels that are no longer needed

#### 4.8.2. Render nodes with D3

##### 4.8.2.1. Setup drag behavior for nodes

##### 4.8.2.2. Data join for nodes using D3 pattern

##### 4.8.2.3. Enter selection for new nodes

##### 4.8.2.4. Add rectangle shape to new node groups

##### 4.8.2.5. Add text labels to new node groups

##### 4.8.2.6. Merge enter and update selections

##### 4.8.2.7. Update node positions

##### 4.8.2.8. Update visual states based on selection and drag

##### 4.8.2.9. Update text color

##### 4.8.2.10. Setup hover effects for interactive feedback

##### 4.8.2.11. Remove nodes that are no longer needed

### 4.9. Component Render - Container for D3 SVG canvas
