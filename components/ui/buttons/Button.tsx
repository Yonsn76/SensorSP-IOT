import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const { isDark } = useTheme();
  const { responsiveSizes } = useResponsive();

  const getButtonStyles = () => {
    const baseStyles = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: responsiveSizes.borderRadiusMedium,
      borderWidth: 1,
      gap: responsiveSizes.spacingSmall,
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: responsiveSizes.spacingMedium,
        paddingVertical: responsiveSizes.spacingSmall,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: responsiveSizes.spacingLarge,
        paddingVertical: responsiveSizes.spacingMedium,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: responsiveSizes.spacingXLarge,
        paddingVertical: responsiveSizes.spacingLarge,
        minHeight: 52,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: isDark ? 'rgba(0, 122, 255, 0.8)' : 'rgba(0, 122, 255, 0.9)',
        borderColor: isDark ? 'rgba(0, 122, 255, 0.3)' : 'rgba(0, 122, 255, 0.3)',
      },
      secondary: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    const disabledStyles = disabled ? {
      opacity: 0.5,
    } : {};

    const widthStyles = fullWidth ? {
      flex: 1,
    } : {};

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyles,
      ...widthStyles,
    };
  };

  const getTextStyles = () => {
    const sizeStyles = {
      small: { fontSize: responsiveSizes.textSmall },
      medium: { fontSize: responsiveSizes.textMedium },
      large: { fontSize: responsiveSizes.textLarge },
    };

    const variantStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: isDark ? '#FFFFFF' : '#000000' },
      outline: { color: isDark ? '#FFFFFF' : '#000000' },
      ghost: { color: isDark ? '#FFFFFF' : '#000000' },
    };

    return {
      fontWeight: '600' as const,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'medium' ? 18 : 20} 
          color={textStyles.color} 
        />
      )}
      <Text style={textStyles}>
        {loading ? 'Cargando...' : title}
      </Text>
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'medium' ? 18 : 20} 
          color={textStyles.color} 
        />
      )}
    </TouchableOpacity>
  );
};

export default Button;

