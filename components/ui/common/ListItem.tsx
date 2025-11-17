import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  variant?: 'default' | 'compact';
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  rightElement,
  onPress,
  showChevron = false,
  isLast = false,
  variant = 'default',
}) => {
  const { isDark } = useTheme();
  const { responsiveSizes } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: variant === 'compact' ? responsiveSizes.spacingSmall : responsiveSizes.spacingMedium,
      paddingHorizontal: responsiveSizes.spacingLarge,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    iconContainer: {
      width: responsiveSizes.iconLarge,
      height: responsiveSizes.iconLarge,
      borderRadius: responsiveSizes.iconLarge / 2,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveSizes.spacingMedium,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: variant === 'compact' ? responsiveSizes.textMedium : responsiveSizes.textLarge,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: subtitle ? 2 : 0,
    },
    subtitle: {
      fontSize: responsiveSizes.textSmall,
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: responsiveSizes.spacingSmall,
    },
    chevron: {
      marginLeft: responsiveSizes.spacingSmall,
    },
  });

  const defaultIconColor = isDark ? '#FFFFFF' : '#000000';
  const finalIconColor = iconColor || defaultIconColor;

  const Content = () => (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={finalIconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightContainer}>
        {rightElement}
        {showChevron && (
          <Ionicons 
            name="chevron-forward-outline" 
            size={16} 
            color={isDark ? '#8E8E93' : '#6D6D70'} 
            style={styles.chevron}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Content />
      </TouchableOpacity>
    );
  }

  return <Content />;
};

export default ListItem;

