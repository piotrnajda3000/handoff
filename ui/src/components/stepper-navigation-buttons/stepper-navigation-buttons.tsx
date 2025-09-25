import { Button, Group, Tooltip } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";

interface StepperNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  canProceedToNext?: boolean;
  nextButtonTooltip?: string;
  nextButtonText?: string;
  nextButtonIcon?: React.ReactNode;
  nextButtonLoading?: boolean;
}

export function StepperNavigationButtons({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canProceedToNext = true,
  nextButtonTooltip = "",
  nextButtonText = "Next",
  nextButtonIcon = <IconChevronRight size={16} />,
  nextButtonLoading = false,
}: StepperNavigationButtonsProps) {
  return (
    <Group className="justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        data-qa="previous-button"
        leftSection={<IconChevronLeft size={16} />}
      >
        Previous
      </Button>

      <Tooltip
        label={nextButtonTooltip}
        disabled={canProceedToNext && currentStep !== totalSteps - 1}
        position="top"
        data-qa="next-button-tooltip"
      >
        <Button
          onClick={onNext}
          data-qa="next-button"
          disabled={!canProceedToNext || currentStep === totalSteps - 1}
          rightSection={
            currentStep === totalSteps - 1 ? (
              <IconCheck size={16} />
            ) : (
              nextButtonIcon
            )
          }
          loading={nextButtonLoading}
        >
          {currentStep === totalSteps - 1 ? "Finish" : nextButtonText}
        </Button>
      </Tooltip>
    </Group>
  );
}
