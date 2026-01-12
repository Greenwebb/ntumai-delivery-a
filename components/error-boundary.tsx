import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches React errors and displays a friendly error screen
 * 
 * Features:
 * - Catches unhandled errors in child components
 * - Shows friendly error message with retry button
 * - Logs errors to console (can be extended to send to Sentry)
 * - Provides "Go Home" and "Try Again" actions
 * 
 * Usage:
 * Wrap your app root in app/_layout.tsx
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service like Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Navigate to home screen
    router.replace('/(tabs)');
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background items-center justify-center p-6">
          <View className="items-center mb-8">
            <View className="bg-error/10 p-4 rounded-full mb-4">
              <AlertCircle size={48} color="#EF4444" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </Text>
            <Text className="text-base text-muted text-center">
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>
          </View>

          {__DEV__ && this.state.error && (
            <View className="bg-surface p-4 rounded-lg mb-6 w-full max-w-md">
              <Text className="text-xs font-mono text-error">
                {this.state.error.toString()}
              </Text>
            </View>
          )}

          <View className="w-full max-w-md gap-3">
            <Pressable
              onPress={this.handleReset}
              className="bg-primary py-4 rounded-lg items-center active:opacity-80"
            >
              <Text className="text-background font-semibold text-base">
                Try Again
              </Text>
            </Pressable>

            <Pressable
              onPress={this.handleGoHome}
              className="bg-surface py-4 rounded-lg items-center active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-base">
                Go to Home
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
