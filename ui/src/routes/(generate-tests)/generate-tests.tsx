import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Paper, Center, Box, Stepper } from "@mantine/core";
import { useDependencies } from "src/hooks/use-dependencies";
import { useRepoConnection } from "src/hooks/use-repo-connection";
import { StepperNavigationButtons } from "src/components/stepper-navigation-buttons";
import { StepOneUploadFiles } from "src/routes/(generate-tests)/-components/step-one-upload-files/step-one-upload-files";
import { StepTwoDescribeRelations } from "src/routes/(generate-tests)/-components/step-two-describe-relations/step-two-describe-relations";
import { StepThreeViewResults } from "src/routes/(generate-tests)/-components/step-three-view-results/step-three-view-results";
import { useFileTree } from "./-components/step-one-upload-files/use-file-tree";

// Interface to make SelectedRepoFile compatible with FileWithPath
interface FileCompatible {
  path: string;
  name: string;
  size: number;
  text: string;
  dependents?: {
    name: string;
    path: string;
  }[];
}

export const Route = createFileRoute("/(generate-tests)/generate-tests")({
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

  console.log({ selectedFiles });

  // Convert SelectedRepoFile to FileWithPath for existing dependencies hook
  const fileCompatibleFiles: FileCompatible[] = selectedFiles.map((file) => ({
    path: file.path,
    name: file.name,
    size: file.size,
    text: file.content, // Add content for compatibility
    dependents: file.dependents,
  }));

  // File Tree Management Hook
  const { fileTree, expandedDirectories, toggleDirectoryExpansion } =
    useFileTree({
      repoFiles: repoConnectionData.repoFiles,
      selectedFiles,
    });

  // Feature Name State
  const [featureName, setFeatureName] = useState("");

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
            fileTree={fileTree}
            expandedDirectories={expandedDirectories}
            featureName={featureName}
            setFeatureName={setFeatureName}
            toggleDirectoryExpansion={toggleDirectoryExpansion}
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
    <Container size="md" className="h-full flex flex-col">
      <Center className="my-auto">
        <Paper className="w-full max-w-[700px] h-full shadow-lg rounded-md p-xl">
          <div className="flex flex-col">
            {/* Step Progress Indicator */}
            <Box>
              <Stepper active={currentStep} size="sm">
                {stepTitles.map((title, index) => (
                  <Stepper.Step key={index} label={title} data-qa={`step`} />
                ))}
              </Stepper>
            </Box>

            {/* Step Content */}
            <div className="mt-xl">{renderStepContent()}</div>

            {/* Navigation */}
            <div className="mt-xl">
              <StepperNavigationButtons
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                onPrevious={handlePrevious}
                canProceedToNext={canProceedToNext}
                nextButtonTooltip={getNextButtonTooltip()}
              />
            </div>
          </div>
        </Paper>
      </Center>
    </Container>
  );
}
