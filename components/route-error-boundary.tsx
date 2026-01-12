import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

type RouteErrorBoundaryProps = {
  error: Error;
  retry?: () => void;
};

export function RouteErrorBoundary({ error, retry }: RouteErrorBoundaryProps) {
  const message = error?.message || "Unexpected error";

  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Something went wrong
      </Text>
      <Text className="text-base text-muted text-center mb-6">
        We hit an unexpected error. Try again or go home.
      </Text>

      {__DEV__ && (
        <View className="bg-surface p-4 rounded-lg mb-6 w-full max-w-md">
          <Text className="text-xs font-mono text-error">{message}</Text>
        </View>
      )}

      <View className="w-full max-w-md gap-3">
        <Pressable
          onPress={() => retry?.()}
          className="bg-primary py-4 rounded-lg items-center active:opacity-80"
        >
          <Text className="text-background font-semibold text-base">
            Try Again
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
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
