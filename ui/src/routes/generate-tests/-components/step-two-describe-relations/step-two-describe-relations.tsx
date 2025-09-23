import { useState } from "react";
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
}
import { InteractiveCanvas } from "../interactive-canvas/interactive-canvas";
import type { Dependency } from "../../../../hooks/use-dependencies";

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

  return (
    <Stack gap="lg">
      <Box ta="center">
        <Title order={2} mb="md">
          Configure File Relationships
        </Title>
        <Text c="dimmed" size="lg">
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
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text size="lg" fw={500}>
                  Dependencies
                </Text>
                <Group gap="xs">
                  <Button
                    leftSection={<IconSparkles size={16} />}
                    onClick={generateDependencies}
                    variant="light"
                  >
                    Generate
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
                <Paper p="lg" withBorder>
                  <Text ta="center" c="dimmed">
                    No dependencies defined yet. Click "Generate" or "Add" to
                    get started.
                  </Text>
                </Paper>
              ) : (
                <Stack gap="sm">
                  {dependencies.map((dependency) => (
                    <Paper key={dependency.id} p="md" withBorder>
                      <Group justify="space-between" align="flex-end">
                        <Group flex={1} align="flex-end" wrap="nowrap">
                          <Select
                            label="From"
                            placeholder="Select file"
                            data={fileOptions}
                            value={dependency.from}
                            onChange={(value) =>
                              updateDependency(
                                dependency.id,
                                "from",
                                value || ""
                              )
                            }
                            style={{ minWidth: 200 }}
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
                            style={{ minWidth: 120 }}
                          />
                          <Select
                            label="To"
                            placeholder="Select file"
                            data={fileOptions}
                            value={dependency.to}
                            onChange={(value) =>
                              updateDependency(dependency.id, "to", value || "")
                            }
                            style={{ minWidth: 200 }}
                          />
                        </Group>
                        <div className={Select.classes.wrapper}>
                          <Box
                            display="flex"
                            style={{ alignItems: "center" }}
                            h="var(--input-height)"
                          >
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => removeDependency(dependency.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Box>
                        </div>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="visualize">
            <Stack gap="md">
              <Text size="sm" c="dimmed" ta="center">
                Drag nodes to organize them. Use mouse wheel to zoom, click and
                drag empty space to pan.
              </Text>
              <InteractiveCanvas files={files} edges={edges} />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Text ta="center" c="orange">
          No files available. Please go back to step 1 and upload some files.
        </Text>
      )}
    </Stack>
  );
}
