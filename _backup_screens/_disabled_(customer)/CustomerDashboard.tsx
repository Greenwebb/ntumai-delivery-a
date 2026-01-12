// @ts-nocheck

import MarketplaceScreen from '@/screens/home/MarketplaceScreen';

export default function CustomerDashboardRoute(props: any) {
  return <MarketplaceScreen {...props} />;
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

