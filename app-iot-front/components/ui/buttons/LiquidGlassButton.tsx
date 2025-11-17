import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface LiquidGlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { isDark } = useTheme();

  const getButtonStyles = () => {
    const baseStyles: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      borderWidth: 1.5,
      // Liquid Glass effect - Más pronunciado
      transform: [{ scale: 1.01 }],
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        minHeight: 44,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: isDark ? 'rgba(10, 132, 255, 0.9)' : '#007AFF',
        borderColor: isDark ? 'rgba(10, 132, 255, 0.8)' : '#007AFF',
      },
      secondary: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.75)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.3)',
      },
      danger: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyles = () => {
    const baseTextStyles: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    const variantTextStyles = {
      primary: { color: isDark ? '#FFFFFF' : '#000000' },
      secondary: { color: isDark ? '#FFFFFF' : '#000000' },
      danger: { color: '#FFFFFF' },
      ghost: { color: isDark ? '#FFFFFF' : '#000000' },
    };

    const sizeTextStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    return {
      ...baseTextStyles,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;
    const iconColor = variant === 'primary' ? (isDark ? '#FFFFFF' : '#000000') :
                      variant === 'danger' ? '#FFFFFF' : 
                      variant === 'secondary' ? (isDark ? '#FFFFFF' : '#000000') :
                      (isDark ? '#FFFFFF' : '#000000');

    return (
      <Ionicons
        name={icon}
        size={iconSize}
        color={iconColor}
        style={{
          marginRight: iconPosition === 'left' ? 8 : 0,
          marginLeft: iconPosition === 'right' ? 8 : 0,
        }}
      />
    );
  };

    return (
      <TouchableOpacity
        style={[getButtonStyles(), style] as any}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
      {icon && iconPosition === 'left' && renderIcon()}
      <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      {icon && iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

export default LiquidGlassButton;
