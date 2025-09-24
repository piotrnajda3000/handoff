import { useState, useMemo } from "react";
import {
  Stack,
  Box,
  Title,
  Text,
  Tabs,
  Button,
  Select,
  Group,
  Paper,
  ActionIcon,
  Space,
} from "@mantine/core";
import { IconPlus, IconSparkles, IconTrash } from "@tabler/icons-react";
// Use a more flexible file interface that works with both uploaded and repo files
interface FileWithPathLike {
  path?: string;
  name: string;
  size?: number;
  dependents?: {
    name: string;
    path: string;
  }[];
}
import { InteractiveCanvas } from "src/routes/(generate-tests)/-components/interactive-canvas/interactive-canvas";
import type { Dependency } from "src/hooks/use-dependencies";

interface DependenciesData {
  dependencies: Dependency[];
  fileOptions: { value: string; label: string }[];
  connectionOptions: { value: string; label: string }[];
  edges: Array<{ id: string; from: string; to: string; description: string }>;
  addDependency: () => void;
  updateDependency: (
    id: string,
    field: keyof Dependency,
    value: string
  ) => void;
  removeDependency: (id: string) => void;
  generateDependencies: () => void;
}

interface StepTwoDescribeRelationsProps {
  files: FileWithPathLike[];
  dependenciesData: DependenciesData;
}

export function StepTwoDescribeRelations({
  files,
  dependenciesData,
}: StepTwoDescribeRelationsProps) {
  const [activeTab, setActiveTab] = useState<string>("describe");
  const {
    dependencies,
    fileOptions,
    connectionOptions,
    edges,
    addDependency,
    updateDependency,
    removeDependency,
    generateDependencies,
  } = dependenciesData;

  // Calculate potential dependencies from file dependents
  const potentialDependenciesCount = useMemo(() => {
    let count = 0;
    const existingPairs = new Set(
      dependencies.map((dep) => `${dep.from}->${dep.to}`)
    );

    files.forEach((file) => {
      const fileIdentifier = file.path || file.name;

      if (file.dependents && file.dependents.length > 0) {
        file.dependents.forEach((dependent) => {
          const pairKey = `${dependent.path}->${fileIdentifier}`;
          if (!existingPairs.has(pairKey)) {
            count++;
          }
        });
      }
    });

    return count;
  }, [files, dependencies]);

  return (
    <Stack className="gap-lg">
      <Box className="text-center">
        <Title order={2} className="mb-md">
          Configure File Relationships
        </Title>
        <Text size="lg" className="text-gray-600">
          Describe file relationships or visualize them interactively
        </Text>
      </Box>

      {files.length > 0 ? (
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "describe")}
        >
          <Tabs.List grow>
            <Tabs.Tab value="describe">Describe</Tabs.Tab>
            <Tabs.Tab value="visualize">Visualize</Tabs.Tab>
          </Tabs.List>

          <Space h="md" />

          <Tabs.Panel value="describe">
            <Stack className="gap-md">
              <Group className="justify-between items-center">
                <Text size="lg" className="font-medium">
                  Dependencies
                </Text>
                <Group gap="xs">
                  <Button
                    leftSection={<IconSparkles size={16} />}
                    onClick={generateDependencies}
                    variant="light"
                  >
                    Generate{" "}
                    {potentialDependenciesCount > 0 &&
                      `(${potentialDependenciesCount})`}
                  </Button>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={addDependency}
                    variant="light"
                  >
                    Add
                  </Button>
                </Group>
              </Group>

              {dependencies.length === 0 ? (
                <Paper className="border-gray-200 rounded-md p-lg">
                  <Text className="text-center text-gray-600">
                    No dependencies defined yet.
                    {potentialDependenciesCount > 0
                      ? ` Click "Generate" to auto-create ${potentialDependenciesCount} dependencies from file imports, or "Add" to create manually.`
                      : ' Click "Add" to create dependencies manually, or use "Select with Dependencies" in step 1 to auto-detect relationships.'}
                  </Text>
                </Paper>
              ) : (
                <Stack className="gap-sm">
                  {dependencies.map((dependency) => (
                    <Paper
                      key={dependency.id}
                      className="border-gray-200 rounded-md p-md"
                    >
                      <div className="flex justify-between flex-end">
                        <div className="flex flex-1 gap-xs flex-end wrap-nowrap">
                          <Select
                            label="From"
                            placeholder="Select file"
                            data={fileOptions}
                            value={dependency.from}
                            comboboxProps={{
                              width: "max-content",
                              position: "bottom-start",
                              middlewares: { flip: false, shift: false },
                            }}
                            onChange={(value) =>
                              updateDependency(
                                dependency.id,
                                "from",
                                value || ""
                              )
                            }
                          />
                          <Select
                            label="Connection"
                            data={connectionOptions}
                            value={dependency.connection}
                            onChange={(value) =>
                              updateDependency(
                                dependency.id,
                                "connection",
                                value || "uses"
                              )
                            }
                          />
                          <Select
                            label="To"
                            placeholder="Select file"
                            data={fileOptions}
                            value={dependency.to}
                            onChange={(value) =>
                              updateDependency(dependency.id, "to", value || "")
                            }
                          />
                        </div>
                        {/* <div className={Select.classes.wrapper}>
                          <Box className="flex items-center h-[var(--input-height)]">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => removeDependency(dependency.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Box>
                        </div> */}
                      </div>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="visualize">
            <Stack className="gap-md">
              <Text size="sm" className="text-gray-600">
                Drag nodes to organize them. Use mouse wheel to zoom, click and
                drag empty space to pan.
              </Text>
              <InteractiveCanvas files={files} edges={edges} />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Text className="text-center text-orange-500">
          No files available. Please go back to step 1 and upload some files.
        </Text>
      )}
    </Stack>
  );
}
