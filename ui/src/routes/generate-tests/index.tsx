import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Paper, Stack, Center, Box, Stepper } from "@mantine/core";
import { useDependencies } from "../../hooks/use-dependencies";
import { useRepoConnection } from "../../hooks/use-repo-connection";
import { StepperNavigationButtons } from "../../components/stepper-navigation-buttons";
import { StepOneUploadFiles } from "./-components/step-one-upload-files/step-one-upload-files";
import { StepTwoDescribeRelations } from "./-components/step-two-describe-relations/step-two-describe-relations";
import { StepThreeViewResults } from "./-components/step-three-view-results/step-three-view-results";

// Interface to make SelectedRepoFile compatible with FileWithPath
interface FileCompatible {
  path: string;
  name: string;
  size: number;
  text: string;
}

export const Route = createFileRoute("/generate-tests/")({
  component: Index,
});

function Index() {
  const [currentStep, setCurrentStep] = useState(0);

  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/piotrnajda3000/handoff.git"
  );
  const [accessToken, setAccessToken] = useState(
    "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"
  );

  // Repository connection hook - manages selected files internally
  const repoConnectionData = useRepoConnection();
  const { selectedFiles } = repoConnectionData;

  // Convert SelectedRepoFile to FileWithPath for existing dependencies hook
  const fileCompatibleFiles: FileCompatible[] = selectedFiles.map((file) => ({
    path: file.path,
    name: file.name,
    size: file.size,
    text: file.content, // Add content for compatibility
  }));

  const dependenciesData = useDependencies(fileCompatibleFiles);

  const stepTitles = ["Connect Repository", "Generate Tests", "Review Results"];
  const totalSteps = stepTitles.length;

  const canProceedToNext = currentStep === 0 ? selectedFiles.length > 0 : true;

  const getNextButtonTooltip = () => {
    if (currentStep === 0) {
      if (selectedFiles.length === 0) {
        return "Please select files from your repository to continue";
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
            repoConnectionData={repoConnectionData}
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            accessToken={accessToken}
            setAccessToken={setAccessToken}
          />
        );
      case 1:
        return (
          <StepTwoDescribeRelations
            files={fileCompatibleFiles}
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
