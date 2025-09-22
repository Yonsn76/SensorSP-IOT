import { BlurView } from 'expo-blur';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LiquidGlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  useBlur?: boolean;
  variant?: 'default' | 'modal' | 'section';
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  intensity,
  useBlur = true,
  variant = 'default',
  ...props
}) => {
  const { isDark } = useTheme();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: variant === 'modal' ? 20 : 24,
      overflow: 'hidden' as const,
      // Liquid Glass effect 100% Apple - Más pronunciado
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      // Efecto de profundidad sutil sin sombras problemáticas
      transform: [{ scale: 1.02 }],
    };

    switch (variant) {
      case 'modal':
        return {
          ...baseStyles,
          width: '90%',
          maxHeight: '85%',
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          transform: [{ scale: 1.01 }],
        };
      case 'section':
        return {
          ...baseStyles,
          marginBottom: 20,
        };
      default:
        return baseStyles;
    }
  };

  const cardStyles = getCardStyles();

  if (useBlur) {
    return (
      <BlurView
        intensity={intensity || (isDark ? 40 : 50)}
        tint={isDark ? 'dark' : 'light'}
        style={[cardStyles, style]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[cardStyles, style]} {...props}>
      {children}
    </View>
  );
};

export default LiquidGlassCard;
