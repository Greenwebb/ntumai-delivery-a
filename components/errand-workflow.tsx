import { View } from "react-native";
import { WorkflowStepper } from "./workflow-stepper";

interface ErrandWorkflowProps {
  currentStep: 1 | 2 | 3;
  children: React.ReactNode;
}

/**
 * ErrandWorkflow - Wrapper for "Do a Task" three-step workflow
 * 
 * Implements the blueprint requirement:
 * "All customer-initiated tasks MUST follow a strict three-step workflow:
 * 1. Selection, 2. Review & Commitment, 3. Finalize & Pay"
 * 
 * Steps:
 * 1. Selection - Choose category, describe task, add checklist/photos
 * 2. Review & Commitment - Set locations, enter commitment amount
 * 3. Finalize & Pay - Select payment, book tasker
 * 
 * Usage:
 * ```tsx
 * <ErrandWorkflow currentStep={2}>
 *   <CommitmentContent />
 * </ErrandWorkflow>
 * ```
 */
export function ErrandWorkflow({ currentStep, children }: ErrandWorkflowProps) {
  return (
    <View className="flex-1 bg-background">
      <WorkflowStepper
        currentStep={currentStep}
        steps={["Task Details", "Location & Cost", "Book Tasker"]}
      />
      <View className="flex-1">{children}</View>
    </View>
  );
}

/**
 * Errand workflow step definitions
 */
export const ERRAND_STEPS = {
  SELECTION: 1 as const,
  COMMITMENT: 2 as const,
  PAYMENT: 3 as const,
};

/**
 * Get step number from route name
 */
export function getErrandStep(routeName: string): 1 | 2 | 3 {
  switch (routeName) {
    case "DoTask":
    case "TaskDetails":
      return ERRAND_STEPS.SELECTION;
    case "TaskCommitment":
      return ERRAND_STEPS.COMMITMENT;
    case "TaskPayment":
    case "TaskConfirmation":
      return ERRAND_STEPS.PAYMENT;
    default:
      return ERRAND_STEPS.SELECTION;
  }
}

/**
 * Errand categories from blueprint
 */
export const ERRAND_CATEGORIES = [
  { id: "shopping", name: "Shopping", icon: "🛒", description: "Buy items from stores" },
  { id: "pickup", name: "Pickup", icon: "📦", description: "Collect items or documents" },
  { id: "paperwork", name: "Paperwork", icon: "📄", description: "Submit or collect documents" },
  { id: "delivery", name: "Delivery", icon: "🚚", description: "Deliver items to someone" },
  { id: "payment", name: "Bill Payment", icon: "💳", description: "Pay bills on your behalf" },
  { id: "other", name: "Other", icon: "✨", description: "Custom errands" },
] as const;
