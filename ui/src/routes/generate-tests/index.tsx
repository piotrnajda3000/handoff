import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Paper, Stack, Center, Box, Stepper } from "@mantine/core";
import { useDropzone } from "../../components/dropzone/use-dropzone";
import { useDependencies } from "../../hooks/use-dependencies";
import { StepperNavigationButtons } from "../../components/stepper-navigation-buttons";
import { StepOneUploadFiles } from "./-components/step-one-upload-files/step-one-upload-files";
import { StepTwoDescribeRelations } from "./-components/step-two-describe-relations/step-two-describe-relations";
import { StepThreeViewResults } from "./-components/step-three-view-results/step-three-view-results";

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

  const dependenciesData = useDependencies(files);

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
          <StepOneUploadFiles
            files={files}
            rejectedFiles={rejectedFiles}
            onDrop={handleDrop}
            onReject={handleReject}
            onDelete={handleDelete}
            onDeleteRejected={handleDeleteRejected}
          />
        );
      case 1:
        return (
          <StepTwoDescribeRelations
            files={files}
            dependenciesData={dependenciesData}
          />
        );
      case 2:
        return <StepThreeViewResults />;
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
                  <Stepper.Step key={index} label={title} data-qa={`step`} />
                ))}
              </Stepper>
            </Box>

            {/* Step Content */}
            <Box>{renderStepContent()}</Box>

            {/* Navigation */}
            <StepperNavigationButtons
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canProceedToNext={canProceedToNext}
              nextButtonTooltip={getNextButtonTooltip()}
            />
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
