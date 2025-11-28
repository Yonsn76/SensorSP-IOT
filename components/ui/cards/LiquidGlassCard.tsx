import { BlurView } from 'expo-blur';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';

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
  const { responsiveSizes } = useResponsive();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: variant === 'modal' ? responsiveSizes.borderRadiusLarge : responsiveSizes.borderRadiusLarge,
      overflow: 'hidden' as const,
      // Liquid Glass effect optimizado para móvil - mejor contraste en modo oscuro
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.75)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
      // Efecto de profundidad sutil sin sombras problemáticas
      transform: [{ scale: 1.01 }], // Reducido para móvil
    };

    switch (variant) {
      case 'modal':
        return {
          ...baseStyles,
          width: '90%',
          maxHeight: '85%',
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
          transform: [{ scale: 1.005 }], // Reducido para móvil
        };
      case 'section':
        return {
          ...baseStyles,
          marginBottom: responsiveSizes.spacingXLarge,
        };
      default:
        return baseStyles;
    }
  };

  const cardStyles = getCardStyles();

  if (useBlur) {
    return (
      <BlurView
        intensity={intensity || (isDark ? 50 : 40)} // Aumentado para modo oscuro para mejor visibilidad
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
