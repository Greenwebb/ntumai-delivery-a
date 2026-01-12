// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Dimensions, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useVendorPerformanceStore, RatingBreakdown, PerformanceMetric, ActionableInsight, PeakHour } from '@/stores/vendor-performance-store';
  const screenWidth = Dimensions.get('window').width;

export default function VendorPerformanceScreen() { const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const { performance,
    loadPerformance,
    refreshPerformance,
    isLoading} = useVendorPerformanceStore();

  useEffect(() => { loadPerformance('vendor-001'); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await refreshPerformance('vendor-001');
    setRefreshing(false); };
  const renderRatingBar = (label: string, value: number, maxValue: number = 5) => { const percentage = (value / maxValue) * 100;
    return (
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm text-foreground">{label}</Text>
          <Text className="text-sm font-semibold text-foreground">{value.toFixed(1)}</Text>
        </View>
        <View className="h-2 bg-muted/20 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    ); };
  const renderMetric = (metric: PerformanceMetric) => { const isAboveAverage = metric.value > metric.average;
  const trendColor = metric.trend === 'up' ? '#22C55E' : metric.trend === 'down' ? '#EF4444' : '#6B7280';
  const trendIcon = metric.trend === 'up' ? 'trending-up' : metric.trend === 'down' ? 'trending-down' : 'minus';

    return (
      <View key={metric.label} className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <Text className="text-xs text-muted mb-1">{metric.label}</Text>
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {metric.value}
              <Text className="text-base text-muted"> {metric.unit}</Text>
            </Text>
            <View className="flex-row items-center mt-1">
              <Feather name={trendIcon} size={12} color={trendColor} />
              <Text className="text-xs ml-1" style={{ color: trendColor }}>
                {metric.trendPercent}% vs last week
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted">Platform Avg</Text>
            <Text className="text-sm font-medium text-muted">{metric.average}{metric.unit}</Text>
            {isAboveAverage && (
              <View className="bg-success/10 px-2 py-0.5 rounded-full mt-1">
                <Text className="text-xs font-medium text-success">Above Avg</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    ); };
  const renderInsight = (insight: ActionableInsight) => { const colors = { positive: { bg: '#22C55E10', text: '#22C55E', border: '#22C55E30' },
      warning: { bg: '#F59E0B10', text: '#F59E0B', border: '#F59E0B30' },
      critical: { bg: '#EF444410', text: '#EF4444', border: '#EF444430' }};
  const color = colors[insight.type];

    return (
      <View
        key={insight.id}
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: color.bg, borderWidth: 1, borderColor: color.border }}
      >
        <View className="flex-row items-start">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: color.bg }}
          >
            <Feather name={insight.icon as any} size={20} color={color.text} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-foreground mb-1">{insight.title}</Text>
            <Text className="text-xs text-muted leading-relaxed">{insight.description}</Text>
            {insight.action && (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="mt-2">
                <Text className="text-xs font-medium" style={{ color: color.text }}>
                  {insight.action} →
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    ); };
  const renderPeakHoursChart = (peakHours: PeakHour[]) => { const maxCount = Math.max(...peakHours.map(h => h.orderCount));
  const barWidth = (screenWidth - 80) / peakHours.length;

    return (
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <Text className="text-base font-semibold text-foreground mb-4">Peak Order Hours</Text>
        <View className="flex-row items-end justify-between" style={{ height: 120 }}>
          {peakHours.map(hour => { const barHeight = (hour.orderCount / maxCount) * 100;
  const isPeak = hour.orderCount > maxCount * 0.7;
            return (
              <View key={hour.hour} className="items-center" style={{ width: barWidth }}>
                <View className="flex-1 justify-end items-center mb-1">
                  {isPeak && (
                    <Text className="text-xs font-medium text-primary mb-1">{hour.orderCount}</Text>
                  )}
                  <View
                    className={`w-6 rounded-t-md ${isPeak ? 'bg-primary' : 'bg-muted/30'}`}
                    style={{ height: `${barHeight}%` }}
                  />
                </View>
                <Text className="text-xs text-muted mt-1" style={{ fontSize: 9 }}>
                  {hour.label.split(' ')[0]}
                </Text>
              </View>
            ); })}
        </View>
        <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-border">
          <View className="w-3 h-3 rounded bg-primary mr-2" />
          <Text className="text-xs text-muted">Peak hours (70%+ of max)</Text>
        </View>
      </View>
    ); };

  if (!performance) { return (
      <ScreenContainer className="bg-background items-center justify-center">
        <Text className="text-muted">Loading performance data...</Text>
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Performance</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {/* Overall Rating */}
        <View className="bg-primary/5 rounded-xl p-6 my-4 items-center">
          <Text className="text-sm text-muted mb-2">Overall Rating</Text>
          <Text className="text-5xl font-bold text-primary">{performance.ratings.overall.toFixed(1)}</Text>
          <View className="flex-row items-center mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Feather
                key={star}
                name="star"
                size={16}
                color={star <= performance.ratings.overall ? '#009688' : '#E5E7EB'}
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>
          <Text className="text-xs text-muted mt-2">Based on {performance.ratings.totalReviews} reviews</Text>
        </View>

        {/* Rating Breakdown */}
        <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
          <Text className="text-base font-semibold text-foreground mb-4">Rating Breakdown</Text>
          {renderRatingBar('Food Quality', performance.ratings.foodQuality)}
          {renderRatingBar('Packaging', performance.ratings.packaging)}
          {renderRatingBar('Delivery Speed', performance.ratings.delivery)}
          {renderRatingBar('Value for Money', performance.ratings.value)}
        </View>

        {/* Performance Metrics */}
        <Text className="text-base font-semibold text-foreground mt-4 mb-3">Key Metrics</Text>
        {performance.metrics.map(renderMetric)}

        {/* Peak Hours Chart */}
        {renderPeakHoursChart(performance.peakHours)}

        {/* Actionable Insights */}
        <Text className="text-base font-semibold text-foreground mt-4 mb-3">Insights & Recommendations</Text>
        {performance.insights.map(renderInsight)}

        {/* Last Updated */}
        <View className="items-center py-6">
          <Text className="text-xs text-muted">
            Last updated: {new Date(performance.lastUpdated).toLocaleString('en-GB', { day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'})}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

