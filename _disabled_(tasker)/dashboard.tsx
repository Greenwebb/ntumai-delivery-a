// @ts-nocheck

import React from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Bike } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';

/**
 * Tasker Dashboard - Placeholder (Phase 5)
 * 
 * TODO: Implement tasker features:
 * - Online/offline toggle
 * - Available jobs list
 * - Job offer screen (accept/decline with timer)
 * - Active job multi-step flow (pickup → transit → delivery)
 * - Earnings tracking
 * - Float top-up
 */
export default function TaskerDashboardScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <EmptyState
        icon={<Bike size={48} color={colors.primary} strokeWidth={1.5} />}
        title="Tasker Dashboard"
        description="Job management, delivery tracking, and earnings features coming in Phase 5"
      />
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

