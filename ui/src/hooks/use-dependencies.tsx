import { useState } from "react";
import type { Edge } from "../routes/(generate-tests)/-components/interactive-canvas/interactive-canvas";

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
  dependents?: {
    name: string;
    path: string;
  }[];
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
    const generatedDependencies: Dependency[] = [];

    // Iterate through all files and use their dependents array to create dependencies
    files.forEach((file) => {
      const fileIdentifier = file.path || file.name;

      // If this file has dependents, create dependencies for each one
      if (file.dependents && file.dependents.length > 0) {
        file.dependents.forEach((dependent) => {
          // Create a dependency: dependent file "uses" current file
          const dependency: Dependency = {
            id: crypto.randomUUID(),
            from: dependent.path, // The file that imports this one
            to: fileIdentifier, // The current file being imported
            connection: "uses", // Default connection type
          };

          // Check if this dependency already exists to avoid duplicates
          const existsInGenerated = generatedDependencies.some(
            (dep) => dep.from === dependency.from && dep.to === dependency.to
          );
          const existsInCurrent = dependencies.some(
            (dep) => dep.from === dependency.from && dep.to === dependency.to
          );

          if (!existsInGenerated && !existsInCurrent) {
            generatedDependencies.push(dependency);
          }
        });
      }
    });

    // Add the generated dependencies to the existing ones
    if (generatedDependencies.length > 0) {
      setDependencies([...dependencies, ...generatedDependencies]);
      console.log(
        `Generated ${generatedDependencies.length} dependencies from file relationships`
      );
    } else {
      console.log("No dependencies found in file relationships");
    }
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
