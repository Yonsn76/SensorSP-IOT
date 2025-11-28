import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHeaderStyles } from '../../../styles/headerStyles';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightButton?: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    onPress: () => void;
  };
  showBlur?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  icon = 'home-outline',
  rightButton,
  showBlur = true,
}) => {
  const { isDark } = useTheme();
  const headerStyles = useHeaderStyles();

  const HeaderContent = () => (
    <View style={headerStyles.headerContent}>
      <View style={headerStyles.headerIconContainer}>
        <Ionicons name={icon} size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={headerStyles.headerTitle}>{title}</Text>
        {subtitle && <Text style={headerStyles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <View style={headerStyles.header}>
      {showBlur ? (
        <BlurView
          intensity={isDark ? 20 : 0}
          tint={isDark ? 'dark' : 'light'}
          style={headerStyles.headerGlass}
        >
          <HeaderContent />
          {rightButton && (
            <TouchableOpacity
              style={headerStyles.headerButton}
              onPress={rightButton.onPress}
            >
              <Ionicons 
                name={rightButton.icon} 
                size={16} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
              <Text style={headerStyles.headerButtonText}>{rightButton.text}</Text>
            </TouchableOpacity>
          )}
        </BlurView>
      ) : (
        <View style={headerStyles.headerGlass}>
          <HeaderContent />
          {rightButton && (
            <TouchableOpacity
              style={headerStyles.headerButton}
              onPress={rightButton.onPress}
            >
              <Ionicons 
                name={rightButton.icon} 
                size={16} 
                color={isDark ? '#FFFFFF' : '#000000'} 
              />
              <Text style={headerStyles.headerButtonText}>{rightButton.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;

