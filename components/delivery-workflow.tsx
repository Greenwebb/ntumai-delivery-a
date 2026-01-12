import { View } from "react-native";
import { WorkflowStepper } from "./workflow-stepper";

interface DeliveryWorkflowProps {
  currentStep: 1 | 2 | 3;
  children: React.ReactNode;
}

/**
 * DeliveryWorkflow - Wrapper for P2P delivery three-step workflow
 * 
 * Implements the blueprint requirement:
 * "All customer-initiated tasks MUST follow a strict three-step workflow:
 * 1. Selection, 2. Review & Commitment, 3. Finalize & Pay"
 * 
 * Steps:
 * 1. Selection - Describe item, select delivery type, set locations
 * 2. Review & Commitment - Enter recipient details, confirm price
 * 3. Finalize & Pay - Select payment, book delivery
 * 
 * Usage:
 * ```tsx
 * <DeliveryWorkflow currentStep={2}>
 *   <RecipientDetailsContent />
 * </DeliveryWorkflow>
 * ```
 */
export function DeliveryWorkflow({ currentStep, children }: DeliveryWorkflowProps) {
  return (
    <View className="flex-1 bg-background">
      <WorkflowStepper
        currentStep={currentStep}
        steps={["Package Details", "Recipient Info", "Book & Pay"]}
      />
      <View className="flex-1">{children}</View>
    </View>
  );
}

/**
 * Delivery workflow step definitions
 */
export const DELIVERY_STEPS = {
  SELECTION: 1 as const,
  RECIPIENT: 2 as const,
  PAYMENT: 3 as const,
};

/**
 * Get step number from route name
 */
export function getDeliveryStep(routeName: string): 1 | 2 | 3 {
  switch (routeName) {
    case "SendParcel":
    case "ParcelDetails":
      return DELIVERY_STEPS.SELECTION;
    case "RecipientDetails":
      return DELIVERY_STEPS.RECIPIENT;
    case "DeliveryPayment":
    case "DeliveryConfirmation":
      return DELIVERY_STEPS.PAYMENT;
    default:
      return DELIVERY_STEPS.SELECTION;
  }
}
