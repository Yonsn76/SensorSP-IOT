import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  useBlur?: boolean;
  intensity?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  useBlur = true,
  intensity,
  style,
  ...props
}) => {
  const { isDark } = useTheme();
  const { responsiveSizes } = useResponsive();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: responsiveSizes.borderRadiusLarge,
      overflow: 'hidden' as const,
    };

    const variantStyles = {
      default: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1.5,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.1)',
      },
      elevated: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1.5,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
        shadowColor: isDark ? '#000000' : '#000000',
        shadowOffset: responsiveSizes.shadowOffset,
        shadowOpacity: 0.1,
        shadowRadius: responsiveSizes.shadowRadius,
        elevation: 4,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
      },
      filled: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 1)' : 'rgba(255, 255, 255, 1)',
        borderWidth: 0,
      },
    };

    const paddingStyles = {
      none: {},
      small: { padding: responsiveSizes.spacingSmall },
      medium: { padding: responsiveSizes.spacingMedium },
      large: { padding: responsiveSizes.spacingLarge },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...paddingStyles[padding],
    };
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

export default Card;

