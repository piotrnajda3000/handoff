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
}

export function StepperNavigationButtons({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canProceedToNext = true,
  nextButtonTooltip = "",
}: StepperNavigationButtonsProps) {
  return (
    <Group justify="space-between">
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
              <IconChevronRight size={16} />
            )
          }
        >
          {currentStep === totalSteps - 1 ? "Finish" : "Next"}
        </Button>
      </Tooltip>
    </Group>
  );
}
