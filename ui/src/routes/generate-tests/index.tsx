import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Container,
  Paper,
  Stack,
  Center,
  Title,
  Text,
  Box,
  Button,
  Group,
  Stepper,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";
import { FileDropzone } from "../../components/dropzone/dropzone";
import { useDropzone } from "../../components/dropzone/use-dropzone";

export const Route = createFileRoute("/generate-tests/")({
  component: Index,
});

function Index() {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    files,
    rejectedFiles,
    handleDrop,
    handleReject,
    handleDelete,
    handleDeleteRejected,
  } = useDropzone();

  const stepTitles = ["Upload Files", "Generate Tests", "Review Results"];
  const totalSteps = stepTitles.length;

  const canProceedToNext =
    currentStep === 0 ? files.length > 0 && rejectedFiles.length === 0 : true;

  const getNextButtonTooltip = () => {
    if (currentStep === 0) {
      if (files.length === 0) {
        return "Please upload files to continue";
      }
      if (rejectedFiles.length > 0) {
        return "Please remove rejected files to continue";
      }
    }
    if (currentStep === totalSteps - 1) {
      return "Complete the process";
    }
    return "";
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Stack gap="lg">
            <Box ta="center">
              <Title order={1} size="h2" mb="md">
                Welcome to Handoff
              </Title>
              <Text c="dimmed" size="lg">
                Upload your code files to generate natural language test cases
              </Text>
            </Box>

            <FileDropzone
              files={files}
              rejectedFiles={rejectedFiles}
              onDrop={handleDrop}
              onReject={handleReject}
              onDelete={handleDelete}
              onDeleteRejected={handleDeleteRejected}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack gap="lg">
            <Box ta="center">
              <Title order={2} mb="md">
                Generate Tests
              </Title>
              <Text c="dimmed" size="lg">
                Processing your files to generate test cases...
              </Text>
            </Box>
            {/* This will be implemented later */}
            <Text ta="center" c="blue">
              Coming soon: Test generation in progress
            </Text>
          </Stack>
        );
      case 2:
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
            {/* This will be implemented later */}
            <Text ta="center" c="green">
              Coming soon: Generated test results
            </Text>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Container size="md" style={{ height: "100vh" }}>
      <Center style={{ height: "100%" }}>
        <Paper
          shadow="lg"
          radius="md"
          p="xl"
          style={{ width: "100%", maxWidth: 700 }}
        >
          <Stack gap="xl">
            {/* Step Progress Indicator */}
            <Box>
              <Stepper active={currentStep} size="sm">
                {stepTitles.map((title, index) => (
                  <Stepper.Step key={index} label={title} />
                ))}
              </Stepper>
            </Box>

            {/* Step Content */}
            <Box>{renderStepContent()}</Box>

            {/* Navigation */}
            <Group justify="space-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                data-qa="previous-button"
                leftSection={<IconChevronLeft size={16} />}
              >
                Previous
              </Button>

              <Tooltip
                label={getNextButtonTooltip()}
                disabled={canProceedToNext && currentStep !== totalSteps - 1}
                position="top"
                data-qa="next-button-tooltip"
              >
                <Button
                  onClick={handleNext}
                  data-qa="next-button"
                  disabled={!canProceedToNext || currentStep === totalSteps - 1}
                  rightSection={
                    currentStep === totalSteps - 1 ? (
                      <IconCheck size={16} />
                    ) : (
                      <IconChevronRight size={16} />
                    )
                  }
                >
                  {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                </Button>
              </Tooltip>
            </Group>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
