import { useState } from "react";
import type { Edge } from "../routes/generate-tests/-components/interactive-canvas/interactive-canvas";

export interface Dependency {
  id: string;
  from: string;
  to: string;
  connection: string;
}

// Make the hook more flexible to accept file-like objects
interface FileWithPathOrContent {
  path?: string;
  name: string;
  size?: number;
}

export function useDependencies(files: FileWithPathOrContent[]) {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  // Generate file options for select dropdowns
  const fileOptions = files.map((file) => ({
    value: file.path || file.name,
    label: file.path || file.name,
  }));

  const connectionOptions = [
    { value: "uses", label: "uses" },
    { value: "tests", label: "tests" },
    { value: "describes", label: "describes" },
  ];

  const addDependency = () => {
    const newDependency: Dependency = {
      id: crypto.randomUUID(),
      from: "",
      to: "",
      connection: "uses",
    };
    setDependencies([...dependencies, newDependency]);
  };

  const updateDependency = (
    id: string,
    field: keyof Dependency,
    value: string
  ) => {
    setDependencies(
      dependencies.map((dep) =>
        dep.id === id ? { ...dep, [field]: value } : dep
      )
    );
  };

  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter((dep) => dep.id !== id));
  };

  // Convert dependencies to edges for the canvas
  const convertDependenciesToEdges = (): Edge[] => {
    // Create mapping from file path/name to node ID
    const fileToNodeIdMap = new Map<string, string>();
    files.forEach((file, index) => {
      const fileIdentifier = file.path || file.name;
      fileToNodeIdMap.set(fileIdentifier, `file-${index}`);
    });

    // Convert dependencies to edges
    return dependencies
      .filter((dep) => {
        // Only include dependencies where both from and to files exist
        return fileToNodeIdMap.has(dep.from) && fileToNodeIdMap.has(dep.to);
      })
      .map((dep) => ({
        id: dep.id,
        from: fileToNodeIdMap.get(dep.from)!,
        to: fileToNodeIdMap.get(dep.to)!,
        description: dep.connection,
      }));
  };

  const edges = convertDependenciesToEdges();

  const generateDependencies = () => {
    // For now, this is a placeholder. In a real implementation, this could:
    // - Use AI to analyze files and suggest dependencies
    // - Parse imports/exports to find relationships
    // - Add some basic dependencies based on file structure
    console.log("Generate dependencies functionality to be implemented");
  };

  return {
    dependencies,
    fileOptions,
    connectionOptions,
    edges,
    addDependency,
    updateDependency,
    removeDependency,
    generateDependencies,
  };
}
