import { describe, it, expect } from "vitest";
import {
  extractImportStatements,
  extractFromPaths,
  filterRelevantImports,
  resolveToFullPaths,
} from "./import-parse.util";

const file = [
  {
    path: "ui/src/my-folder/main.tsx",
    name: "main.tsx",
    content: `import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createAppWrapper } from "src/setup.tsx";
import { test } from './test.ts';

// Import the generated route tree
import { routeTree } from "src/routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      {createAppWrapper(<RouterProvider router={router} />)}
    </StrictMode>
  );
}
`,
    size: 775,
  },
];

const rootFolder = "ui";
const allPaths = ["ui", "ui/src", "ui/src/my-folder"];

const fileExpectedImportPaths = [
  "import ReactDOM from 'react-dom/client';",
  "import { RouterProvider, createRouter } from '@tanstack/react-router';",
  "import { createAppWrapper } from 'src/setup.tsx';",
  "import { test } from './test.ts';",
  "import { routeTree } from 'src/routeTree.gen';",
];

/**
 * Narrow down to only the import paths that are relative to the file or that folders exist within allPaths
 */
const fileExpectedFromPaths = [
  "src/setup.tsx",
  "./test.ts",
  "src/routeTree.gen",
];

const fileExpectedFullPath = [
  "ui/src/setup.tsx",
  "ui/src/my-folder/test.ts",
  "ui/src/routeTree.gen",
];

describe("import-parse utilities", () => {
  describe("extractImportStatements", () => {
    it("should extract all import statements from code", () => {
      const result = extractImportStatements(file[0].content);
      expect(result).toEqual([
        'import { StrictMode } from "react"',
        'import ReactDOM from "react-dom/client"',
        'import { RouterProvider, createRouter } from "@tanstack/react-router"',
        'import { createAppWrapper } from "src/setup.tsx"',
        "import { test } from './test.ts'",
        'import { routeTree } from "src/routeTree.gen"',
      ]);
    });
  });

  describe("extractFromPaths", () => {
    it("should extract the from paths from import statements", () => {
      const imports = [
        'import { StrictMode } from "react"',
        'import ReactDOM from "react-dom/client"',
        'import { RouterProvider, createRouter } from "@tanstack/react-router"',
        'import { createAppWrapper } from "src/setup.tsx"',
        "import { test } from './test.ts'",
        'import { routeTree } from "src/routeTree.gen"',
      ];

      const result = extractFromPaths(imports);
      expect(result).toEqual([
        "react",
        "react-dom/client",
        "@tanstack/react-router",
        "src/setup.tsx",
        "./test.ts",
        "src/routeTree.gen",
      ]);
    });
  });

  describe("filterRelevantImports", () => {
    it("should filter imports to only include relative imports and those within allPaths", () => {
      const fromPaths = [
        "react",
        "react-dom/client",
        "@tanstack/react-router",
        "src/setup.tsx",
        "./test.ts",
        "src/routeTree.gen",
      ];

      const result = filterRelevantImports(fromPaths, allPaths, rootFolder);
      expect(result).toEqual(fileExpectedFromPaths);
    });
  });

  describe("resolveToFullPaths", () => {
    it("should resolve relative paths to full paths", () => {
      const result = resolveToFullPaths(
        fileExpectedFromPaths,
        file[0].path,
        rootFolder
      );
      expect(result).toEqual(fileExpectedFullPath);
    });
  });

  describe("integration test", () => {
    it("should process file content through the complete pipeline", () => {
      const imports = extractImportStatements(file[0].content);
      const fromPaths = extractFromPaths(imports);
      const filtered = filterRelevantImports(fromPaths, allPaths, rootFolder);
      const fullPaths = resolveToFullPaths(filtered, file[0].path, rootFolder);

      expect(filtered).toEqual(fileExpectedFromPaths);
      expect(fullPaths).toEqual(fileExpectedFullPath);
    });
  });
});
