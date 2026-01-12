import { View } from "react-native";
import { WorkflowStepper } from "./workflow-stepper";

interface MarketplaceWorkflowProps {
  currentStep: 1 | 2 | 3;
  children: React.ReactNode;
}

/**
 * MarketplaceWorkflow - Wrapper for marketplace three-step workflow
 * 
 * Implements the blueprint requirement:
 * "All customer-initiated tasks MUST follow a strict three-step workflow:
 * 1. Selection, 2. Review & Commitment, 3. Finalize & Pay"
 * 
 * Steps:
 * 1. Selection - Browse stores, add items to cart
 * 2. Review & Commitment - Review cart, add instructions
 * 3. Finalize & Pay - Select address, payment, place order
 * 
 * Usage:
 * ```tsx
 * <MarketplaceWorkflow currentStep={2}>
 *   <CartContent />
 * </MarketplaceWorkflow>
 * ```
 */
export function MarketplaceWorkflow({ currentStep, children }: MarketplaceWorkflowProps) {
  return (
    <View className="flex-1 bg-background">
      <WorkflowStepper
        currentStep={currentStep}
        steps={["Select Items", "Review Order", "Payment"]}
      />
      <View className="flex-1">{children}</View>
    </View>
  );
}

/**
 * Marketplace workflow step definitions
 */
export const MARKETPLACE_STEPS = {
  SELECTION: 1 as const,
  REVIEW: 2 as const,
  PAYMENT: 3 as const,
};

/**
 * Get step number from route name
 */
export function getMarketplaceStep(routeName: string): 1 | 2 | 3 {
  switch (routeName) {
    case "Marketplace":
    case "VendorDetail":
    case "ProductDetail":
      return MARKETPLACE_STEPS.SELECTION;
    case "Cart":
      return MARKETPLACE_STEPS.REVIEW;
    case "Checkout":
    case "CheckoutScreen":
      return MARKETPLACE_STEPS.PAYMENT;
    default:
      return MARKETPLACE_STEPS.SELECTION;
  }
}
