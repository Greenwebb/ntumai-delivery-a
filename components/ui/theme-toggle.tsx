// @ts-nocheck
import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useThemeContext } from '@/lib/theme-provider';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useThemeContext();
  const colors = useColors();
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`w-10 h-10 rounded-full items-center justify-center bg-foreground/10 ${className || ''}`}
      activeOpacity={0.7}
    >
      {isDark ? (
        <Sun size={20} color={colors.foreground} strokeWidth={2} />
      ) : (
        <Moon size={20} color={colors.foreground} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}
