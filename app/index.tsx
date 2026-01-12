// @ts-nocheck
import { Redirect } from 'expo-router';

/**
 * Root index - Entry point that redirects to splash screen
 * Using Redirect component instead of router.push for better compatibility
 */
export default function Index() {
  return <Redirect href="/(launch)/splash" />;
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

