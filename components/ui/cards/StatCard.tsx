import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'highlighted';
  size?: 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: any;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  trend,
  trendValue,
  variant = 'default',
  size = 'medium',
  padding = 'medium',
  style,
}) => {
  const { isDark } = useTheme();
  const { responsiveSizes } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
      height: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
      borderRadius: size === 'small' ? 16 : size === 'medium' ? 20 : 24,
      backgroundColor: variant === 'highlighted' 
        ? (isDark ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)')
        : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveSizes.spacingSmall,
    },
    value: {
      fontSize: size === 'small' ? responsiveSizes.textLarge : 
               size === 'medium' ? responsiveSizes.textXLarge : 
               responsiveSizes.textXLarge + 4,
      fontWeight: '700',
      color: variant === 'highlighted' 
        ? (isDark ? '#007AFF' : '#007AFF')
        : (isDark ? '#FFFFFF' : '#1D1D1F'),
      marginBottom: 4,
      textAlign: 'center',
    },
    title: {
      fontSize: size === 'small' ? responsiveSizes.textSmall : responsiveSizes.textMedium,
      color: isDark ? '#8E8E93' : '#6D6D70',
      textAlign: 'center',
      marginBottom: trend ? 4 : 0,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    trendText: {
      fontSize: responsiveSizes.textSmall,
      fontWeight: '600',
    },
    trendUp: {
      color: '#34C759',
    },
    trendDown: {
      color: '#FF3B30',
    },
    trendNeutral: {
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
  });

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return styles.trendUp;
      case 'down': return styles.trendDown;
      case 'neutral': return styles.trendNeutral;
      default: return styles.trendNeutral;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up-outline';
      case 'down': return 'trending-down-outline';
      case 'neutral': return 'remove-outline';
      default: return 'remove-outline';
    }
  };

  const defaultIconColor = variant === 'highlighted' 
    ? (isDark ? '#007AFF' : '#007AFF')
    : (isDark ? '#FFFFFF' : '#000000');

  return (
    <Card variant="default" padding={padding} style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} 
            color={iconColor || defaultIconColor} 
          />
        </View>
      )}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={getTrendIcon() as keyof typeof Ionicons.glyphMap} 
            size={12} 
            color={getTrendColor().color} 
          />
          <Text style={[styles.trendText, getTrendColor()]}>
            {trendValue}
          </Text>
        </View>
      )}
    </Card>
  );
};

export default StatCard;

