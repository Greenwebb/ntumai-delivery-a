// @ts-nocheck

import React from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Store } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';

/**
 * Vendor Dashboard - Placeholder (Phase 6+)
 * 
 * TODO: Implement vendor features:
 * - Product management (add, edit, delete)
 * - Order management
 * - Inventory tracking
 * - Sales analytics
 * - Store settings
 */
export default function VendorDashboardScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <EmptyState
        icon={<Store size={48} color={colors.primary} strokeWidth={1.5} />}
        title="Vendor Dashboard"
        description="Vendor features coming in future phases"
      />
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

