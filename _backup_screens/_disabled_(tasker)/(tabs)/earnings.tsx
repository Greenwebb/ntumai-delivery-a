// @ts-nocheck
import React from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { DollarSign } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';

/**
 * Earnings Screen - Tasker Tab
 * 
 * Shows tasker earnings history and statistics
 */
export default function EarningsScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <EmptyState
        icon={<DollarSign size={48} color={colors.primary} strokeWidth={1.5} />}
        title="No Earnings Yet"
        description="Your earnings history will appear here"
      />
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

