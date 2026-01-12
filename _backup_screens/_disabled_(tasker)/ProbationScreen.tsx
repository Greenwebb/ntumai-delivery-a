// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useState, useEffect } from 'react';

import { View, ScrollView, Dimensions, Pressable } from 'react-native';

import { kpiMockService } from '@/src/api/mockServices.extended';

import { ProgressBar } from '@/src/components';
import { useToast } from '@/lib/toast-provider';
  const { width } = Dimensions.get('window');

interface KPI { name: string;

  current: number;

  target: number;

  unit: string;

  status: 'good' | 'warning' | 'critical'; }

export default function ProbationScreen() { const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => { loadProbationData(); }, []);
  const loadProbationData = async () => { try { const response = await kpiMockService.getProbationKPIs('tasker_1');

      if (response.success) { setKpis(response.data);

        setAlerts(response.data.alerts || []); } } catch (error) { toast.error('Failed to load probation data'); } finally { setLoading(false); } };
  const getKPIStatus = (current: number, target: number): 'good' | 'warning' | 'critical' => { const percentage = (current / target) * 100;

    if (percentage >= 100) return 'good';

    if (percentage >= 90) return 'warning';

    return 'critical'; };
  const getStatusColor = (status: string) => { switch (status) { case 'good':

        return 'bg-green-100 border-green-300';

      case 'warning':

        return 'bg-yellow-100 border-yellow-300';

      case 'critical':

        return 'bg-red-100 border-red-300';

      default:

        return 'bg-surface border-border'; } };
  const getStatusTextColor = (status: string) => { switch (status) { case 'good':

        return 'text-green-700';

      case 'warning':

        return 'text-yellow-700';

      case 'critical':

        return 'text-red-700';

      default:

        return 'text-gray-700'; } };

  if (loading) { return (

      <View className="flex-1 justify-center items-center bg-background">

        <LoadingState />

      </View>

    ); }

  if (!kpis) { return (

      <View className="flex-1 justify-center items-center bg-background">

        <Text className="text-muted">No probation data available</Text>

      </View>

    ); }

  return (

    <ScrollView className="flex-1 bg-surface">

      {/* Header */}

      <View className="bg-background border-b border-border px-4 py-4">

        <Text className="text-2xl font-bold text-foreground">Probation Period</Text>

        <Text className="text-sm text-muted mt-1">

          {kpis.daysRemaining} days remaining

        </Text>

      </View>

      <View className="px-4 py-4">

        {/* Probation Progress */}

        <View className="bg-background rounded-lg p-4 mb-4 border border-border">

          <Text className="text-lg font-bold text-foreground mb-3">Progress</Text>

          <View className="mb-2">

            <View className="flex-row justify-between items-center mb-2">

              <Text className="text-sm text-muted">Days Completed</Text>

              <Text className="text-sm font-semibold text-foreground">

                {14 - kpis.daysRemaining}/14

              </Text>

            </View>

            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">

              <View

                className="h-full bg-green-500"

                style={{ width: `${((14 - kpis.daysRemaining) / 14) * 100}%`}}

              />

            </View>

          </View>

        </View>

        {/* Alerts */}

        {alerts.length > 0 && (

          <View className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">

            <Text className="text-lg font-bold text-red-900 mb-2">â ï¸ Alerts</Text>

            {alerts.map((alert, index) => (

              <Text key={index} className="text-sm text-red-700 mb-1">

                â¢ {alert.message}

              </Text>

            ))}

          </View>

        )}

        {/* KPI Cards */}

        <Text className="text-lg font-bold text-foreground mb-3">Key Performance Indicators</Text>

        {/* Acceptance Rate */}

        <View className={`rounded-lg p-4 mb-3 border ${getStatusColor(

          getKPIStatus(kpis.kpis.acceptanceRate, kpis.targets.acceptanceRate)

        )}`}>

          <View className="flex-row justify-between items-start mb-2">

            <View>

              <Text className="text-sm text-muted">Acceptance Rate</Text>

              <Text className="text-2xl font-bold text-foreground mt-1">

                {kpis.kpis.acceptanceRate}%

              </Text>

            </View>

            <Text className={`text-sm font-semibold ${getStatusTextColor(

              getKPIStatus(kpis.kpis.acceptanceRate, kpis.targets.acceptanceRate)

            )}`}>

              Target: {kpis.targets.acceptanceRate}%

            </Text>

          </View>

          <View className="h-2 bg-gray-300 rounded-full overflow-hidden">

            <View

              className="h-full bg-blue-500"

              style={{ width: `${Math.min((kpis.kpis.acceptanceRate / kpis.targets.acceptanceRate) * 100, 100)}%`}}

            />

          </View>

        </View>

        {/* On-Time Rate */}

        <View className={`rounded-lg p-4 mb-3 border ${getStatusColor(

          getKPIStatus(kpis.kpis.onTimeRate, kpis.targets.onTimeRate)

        )}`}>

          <View className="flex-row justify-between items-start mb-2">

            <View>

              <Text className="text-sm text-muted">On-Time Rate</Text>

              <Text className="text-2xl font-bold text-foreground mt-1">

                {kpis.kpis.onTimeRate}%

              </Text>

            </View>

            <Text className={`text-sm font-semibold ${getStatusTextColor(

              getKPIStatus(kpis.kpis.onTimeRate, kpis.targets.onTimeRate)

            )}`}>

              Target: {kpis.targets.onTimeRate}%

            </Text>

          </View>

          <View className="h-2 bg-gray-300 rounded-full overflow-hidden">

            <View

              className="h-full bg-orange-500"

              style={{ width: `${Math.min((kpis.kpis.onTimeRate / kpis.targets.onTimeRate) * 100, 100)}%`}}

            />

          </View>

        </View>

        {/* Completion Rate */}

        <View className={`rounded-lg p-4 mb-3 border ${getStatusColor(

          getKPIStatus(kpis.kpis.completionRate, kpis.targets.completionRate)

        )}`}>

          <View className="flex-row justify-between items-start mb-2">

            <View>

              <Text className="text-sm text-muted">Completion Rate</Text>

              <Text className="text-2xl font-bold text-foreground mt-1">

                {kpis.kpis.completionRate}%

              </Text>

            </View>

            <Text className={`text-sm font-semibold ${getStatusTextColor(

              getKPIStatus(kpis.kpis.completionRate, kpis.targets.completionRate)

            )}`}>

              Target: {kpis.targets.completionRate}%

            </Text>

          </View>

          <View className="h-2 bg-gray-300 rounded-full overflow-hidden">

            <View

              className="h-full bg-green-500"

              style={{ width: `${Math.min((kpis.kpis.completionRate / kpis.targets.completionRate) * 100, 100)}%`}}

            />

          </View>

        </View>

        {/* Average Rating */}

        <View className={`rounded-lg p-4 mb-3 border ${getStatusColor(

          getKPIStatus(kpis.kpis.averageRating * 20, kpis.targets.averageRating * 20)

        )}`}>

          <View className="flex-row justify-between items-start mb-2">

            <View>

              <Text className="text-sm text-muted">Average Rating</Text>

              <Text className="text-2xl font-bold text-foreground mt-1">

                {kpis.kpis.averageRating} â­

              </Text>

            </View>

            <Text className={`text-sm font-semibold ${getStatusTextColor(

              getKPIStatus(kpis.kpis.averageRating * 20, kpis.targets.averageRating * 20)

            )}`}>

              Target: {kpis.targets.averageRating}

            </Text>

          </View>

          <View className="h-2 bg-gray-300 rounded-full overflow-hidden">

            <View

              className="h-full bg-yellow-500"

              style={{ width: `${Math.min((kpis.kpis.averageRating / kpis.targets.averageRating) * 100, 100)}%`}}

            />

          </View>

        </View>

        {/* Incident Rate */}

        <View className={`rounded-lg p-4 mb-4 border ${getStatusColor(

          kpis.kpis.incidentRate <= kpis.targets.incidentRate ? 'good' : 'critical'

        )}`}>

          <View className="flex-row justify-between items-start mb-2">

            <View>

              <Text className="text-sm text-muted">Incident Rate</Text>

              <Text className="text-2xl font-bold text-foreground mt-1">

                {kpis.kpis.incidentRate}%

              </Text>

            </View>

            <Text className={`text-sm font-semibold ${getStatusTextColor(

              kpis.kpis.incidentRate <= kpis.targets.incidentRate ? 'good' : 'critical'

            )}`}>

              Max: {kpis.targets.incidentRate}%

            </Text>

          </View>

          <View className="h-2 bg-gray-300 rounded-full overflow-hidden">

            <View

              className="h-full bg-red-500"

              style={{ width: `${Math.min((kpis.kpis.incidentRate / kpis.targets.incidentRate) * 100, 100)}%`}}

            />

          </View>

        </View>

        {/* Info */}

        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">

          <Text className="text-sm text-blue-900 leading-5">

            <Text className="font-bold">â¹ï¸ Probation Info: </Text>

            You're in your probation period. Maintain all KPIs above the targets to successfully complete probation and earn a badge.

          </Text>

        </View>

      </View>

    </ScrollView>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

