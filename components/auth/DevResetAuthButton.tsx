import { useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Dev-only helper to clear persisted auth state for quick testing.
 * Only renders in __DEV__ builds.
 */
const DevResetAuthButton: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  if (!__DEV__) return null;

  const handleClear = async () => {
    try {
      setIsClearing(true);
      await AsyncStorage.removeItem('auth-store');
      Alert.alert('Auth storage cleared', 'Persistent auth state removed.');
    } catch (error: any) {
      Alert.alert('Clear failed', error?.message || 'Unable to clear auth storage');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleClear}
      disabled={isClearing}
      className="mt-4 self-center px-4 py-2 rounded-lg border border-gray-300"
    >
      <Text className="text-gray-700 text-sm font-medium">
        {isClearing ? 'Clearing…' : 'Reset auth (dev)'}
      </Text>
    </TouchableOpacity>
  );
};

export default DevResetAuthButton;
