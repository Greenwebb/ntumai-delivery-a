// @ts-nocheck

import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import type { User } from '@/lib/stores/types';
import { useAuthContext } from '@/providers';

type UserRole = User['role'];

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/(auth)/SelectMethod',
  allowedRoles,
}) => {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    isInitializing, 
    initializationError, 
    retryInitialization,
    user,
  } = useAuthContext();

  const hasRequiredRole =
    !allowedRoles?.length || (user && allowedRoles.includes(user.role));

  useEffect(() => {
    // Only handle navigation after initialization is complete
    if (!isInitializing && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        // User needs to be authenticated but isn't
        router.replace(redirectTo);
      } else if (requireAuth && isAuthenticated && !hasRequiredRole) {
        router.replace(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.replace('/Home');
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    isInitializing,
    requireAuth,
    redirectTo,
    router,
    hasRequiredRole,
  ]);

  // Show initialization error if present
  if (initializationError && !isInitializing) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Initialization Failed
        </Text>
        <Text className="text-sm text-gray-600 mb-6 text-center">
          {initializationError}
        </Text>
        <TouchableOpacity
          onPress={retryInitialization}
          className="bg-green-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading during initialization or auth loading
  if (isInitializing || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-sm text-gray-600 mt-4">
          {isInitializing ? 'Initializing...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  // For protected routes, only show children if authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAuth && isAuthenticated && !hasRequiredRole) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Access Restricted
        </Text>
        <Text className="text-sm text-gray-600 mb-6 text-center">
          Your account role does not have permission to view this section.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace(redirectTo)}
          className="bg-green-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For public routes, only show children if not authenticated
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
