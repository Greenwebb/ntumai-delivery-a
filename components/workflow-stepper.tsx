import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface WorkflowStepperProps {
  currentStep: 1 | 2 | 3;
  steps: [string, string, string];
  className?: string;
}

/**
 * WorkflowStepper - Visual indicator for three-step workflows
 * 
 * Implements the blueprint requirement:
 * "All customer-initiated tasks MUST follow a strict three-step workflow:
 * 1. Selection, 2. Review & Commitment, 3. Finalize & Pay"
 * 
 * Design: Matches Figma patterns with teal primary color and clean styling
 * 
 * Usage:
 * ```tsx
 * <WorkflowStepper 
 *   currentStep={2} 
 *   steps={["Select Items", "Review Order", "Payment"]} 
 * />
 * ```
 */
export function WorkflowStepper({ currentStep, steps, className }: WorkflowStepperProps) {
  return (
    <View className={cn("px-6 py-4 bg-surface border-b border-border", className)}>
      {/* Step indicators */}
      <View className="flex-row items-center justify-between mb-3">
        {[1, 2, 3].map((step) => (
          <View key={step} className="flex-row items-center flex-1">
            {/* Circle indicator */}
            <View
              className={cn(
                "w-9 h-9 rounded-full items-center justify-center",
                step < currentStep && "bg-success",
                step === currentStep && "bg-primary",
                step > currentStep && "bg-border"
              )}
            >
              {step < currentStep ? (
                <Text className="text-white font-bold text-sm">✓</Text>
              ) : (
                <Text
                  className={cn(
                    "font-bold text-sm",
                    step === currentStep ? "text-white" : "text-muted"
                  )}
                >
                  {step}
                </Text>
              )}
            </View>

            {/* Connecting line (except after last step) */}
            {step < 3 && (
              <View
                className={cn(
                  "flex-1 h-1 mx-2 rounded-full",
                  step < currentStep ? "bg-success" : "bg-border"
                )}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step labels */}
      <View className="flex-row justify-between">
        {steps.map((label, index) => (
          <View key={index} className="flex-1 items-center">
            <Text
              className={cn(
                "text-xs text-center px-1",
                index + 1 === currentStep 
                  ? "text-primary font-semibold" 
                  : index + 1 < currentStep 
                    ? "text-success font-medium"
                    : "text-muted"
              )}
              numberOfLines={2}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
