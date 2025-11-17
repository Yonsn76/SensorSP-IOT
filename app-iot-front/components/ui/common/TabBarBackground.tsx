import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

export default function BlurTabBarBackground() {
  const { isDark } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={isDark ? 20 : 40}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark 
              ? 'rgba(0, 0, 0, 0.95)' 
              : 'rgba(255, 255, 255, 0.98)',
            borderTopWidth: 1,
            borderTopColor: isDark 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(0, 0, 0, 0.15)',
            // Sombra sutil en la parte superior
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 8,
          }
        ]} 
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
