import { useState } from "react";
import type { FileWithPath } from "@mantine/dropzone";
import type { Edge } from "../routes/generate-tests/-components/interactive-canvas/interactive-canvas";

export interface Dependency {
  id: string;
  from: string;
  to: string;
  connection: string;
}

export function useDependencies(files: FileWithPath[]) {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  // Generate file options for select dropdowns
  const fileOptions = files.map((file) => ({
    value: file.path || file.name,
    label: file.name,
  }));

  const connectionOptions = [
    { value: "uses", label: "uses" },
    { value: "describes", label: "describes" },
    { value: "implements", label: "implements" },
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

  return {
    dependencies,
    fileOptions,
    connectionOptions,
    edges,
    addDependency,
    updateDependency,
    removeDependency,
  };
}
