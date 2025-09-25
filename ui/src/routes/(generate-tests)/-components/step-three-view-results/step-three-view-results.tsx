import { useState, useMemo } from "react";
import { Stack, Box, Title, Text, Tabs, Space } from "@mantine/core";
import type { GenerateReportResponse } from "handoff-server/schemas";
import { MarkdownRenderer } from "../../../../components/markdown-renderer";
import { TableOfContents } from "../../../../components/table-of-contents";
import { InteractiveCanvas, type Edge } from "../interactive-canvas/interactive-canvas";

type StepThreeViewResultsProps = {
  report?: GenerateReportResponse;
};

export function StepThreeViewResults({ report }: StepThreeViewResultsProps) {
  const [activeTab, setActiveTab] = useState<string>("report");

  // Process report data for the graph visualization
  const graphData = useMemo(() => {
    if (!report?.files) {
      return { files: [], edges: [], annotations: {} };
    }

    // Create files array for the canvas - use path as unique identifier
    const files = report.files.map((file, index) => ({
      name: file.name,
      path: file.path,
      id: `file-${index}`,
    }));

    // Create edges from dependents relationships
    const edges: Edge[] = [];

    report.files.forEach((file, fileIndex) => {
      const fileId = `file-${fileIndex}`;

      if (file.dependents && file.dependents.length > 0) {
        file.dependents.forEach((dependent, depIndex) => {
          // Find the dependent file's index to get its ID
          const dependentFileIndex = report.files.findIndex(
            (f) => f.path === dependent.path
          );

          if (dependentFileIndex !== -1) {
            const dependentId = `file-${dependentFileIndex}`;
            edges.push({
              id: `edge-${fileIndex}-${dependentFileIndex}-${depIndex}`,
              from: dependentId, // The dependent file points to this file
              to: fileId,
              description: "uses",
              analysis: dependent.analysis, // Include analysis for edge tooltips
            });
          }
        });
      }
    });

    // Create annotations map from file path to annotations array
    const annotations: Record<string, string[]> = {};
    report.files.forEach((file) => {
      if (file.annotations && file.annotations.length > 0) {
        annotations[file.path] = file.annotations;
      }
    });

    return { files, edges, annotations };
  }, [report]);

  return (
    <Stack gap="lg">
      <Box ta="center">
        <Title order={2} mb="md">
          Review Results
        </Title>
        <Text c="dimmed" size="lg">
          Review and download your generated test cases
        </Text>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || "report")}
      >
        <Tabs.List grow>
          <Tabs.Tab value="report">Report</Tabs.Tab>
          <Tabs.Tab value="graph">Graph</Tabs.Tab>
        </Tabs.List>

        <Space h="md" />

        <Tabs.Panel value="report">
          <Stack gap="md">
            {report?.report ? (
              <>
                {/* Table of Contents - only show when report tab is active */}
                {activeTab === "report" && (
                  <TableOfContents content={report.report} />
                )}
                <MarkdownRenderer
                  content={report.report}
                  p="lg"
                  bg="var(--mantine-color-gray-0)"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    minHeight: "60vh",
                    maxHeight: "60vh",
                    overflowY: "auto",
                  }}
                />
              </>
            ) : (
              <Text ta="center" c="dimmed" size="lg" py="xl">
                No report available yet. Generate tests to see results here.
              </Text>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="graph">
          <Stack gap="md">
            {report?.files && report.files.length > 0 ? (
              <>
                <Text size="sm" c="dimmed">
                  Interactive visualization of file dependencies. Drag nodes to
                  organize them, use mouse wheel to zoom, click and drag empty
                  space to pan. Click on a node to view file annotations, or click
                  on an arrow to see dependency analysis.
                </Text>
                <InteractiveCanvas
                  files={graphData.files}
                  edges={graphData.edges}
                  annotations={graphData.annotations}
                />
              </>
            ) : (
              <Text ta="center" c="dimmed" size="lg" py="xl">
                No files available. Generate tests to see the dependency graph
                here.
              </Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
