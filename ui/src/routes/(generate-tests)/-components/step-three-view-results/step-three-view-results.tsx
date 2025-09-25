import { useState } from "react";
import { Stack, Box, Title, Text, Tabs, Space } from "@mantine/core";
import type { GenerateReportResponse } from "handoff-server/schemas";
import { MarkdownRenderer } from "../../../../components/markdown-renderer";
import { TableOfContents } from "../../../../components/table-of-contents";

type StepThreeViewResultsProps = {
  report?: GenerateReportResponse;
};

export function StepThreeViewResults({ report }: StepThreeViewResultsProps) {
  const [activeTab, setActiveTab] = useState<string>("report");

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
            <Text ta="center" c="blue">
              Coming soon: Interactive test coverage graph
            </Text>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
