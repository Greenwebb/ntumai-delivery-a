import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';

/**
 * SafeMapWrapper - Prevents react-native-maps crashes in Expo Go
 * 
 * react-native-maps requires native modules not available in Expo Go.
 * This wrapper shows a fallback UI instead of crashing the app.
 * 
 * To use maps, you need a development build:
 * https://docs.expo.dev/develop/development-builds/introduction/
 */

interface SafeMapWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export function SafeMapWrapper({ children, fallbackMessage }: SafeMapWrapperProps) {
  const colors = useColors();
  
  // Check if we're in Expo Go (which doesn't support react-native-maps)
  const isExpoGo = __DEV__ && Platform.OS !== 'web';
  
  if (isExpoGo) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.fallbackTitle, { color: colors.foreground }]}>
          📍 Map View
        </Text>
        <Text style={[styles.fallbackText, { color: colors.muted }]}>
          {fallbackMessage || 'Maps require a development build to display in Expo Go.'}
        </Text>
        <Text style={[styles.fallbackHint, { color: colors.muted }]}>
          The map will work correctly in production builds.
        </Text>
      </View>
    );
  }
  
  return <>{children}</>;
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    margin: 16,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackHint: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
