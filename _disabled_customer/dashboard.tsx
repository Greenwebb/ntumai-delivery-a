// @ts-nocheck

import React from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Store } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';

/**
 * Customer Dashboard - Placeholder (Phase 2)
 * 
 * TODO: Implement marketplace with:
 * - Promo card carousel
 * - Restaurant/vendor cards
 * - Product grid
 * - Search and category filter
 */
export default function CustomerDashboardScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <EmptyState
        icon={<Store size={48} color={colors.primary} strokeWidth={1.5} />}
        title="Customer Dashboard"
        description="Marketplace, cart, and checkout features coming in Phase 2"
      />
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

