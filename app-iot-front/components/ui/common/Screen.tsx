import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useGlobalStyles } from '../../../styles/globalStyles';
import { useTabBarHeight } from '../../../hooks/useTabBarHeight';
import Header from './Header';

interface ScreenProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightButton?: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    onPress: () => void;
  };
  showHeader?: boolean;
  showBlur?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
  containerStyle?: any;
  contentStyle?: any;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  title,
  subtitle,
  icon,
  rightButton,
  showHeader = true,
  showBlur = true,
  refreshing = false,
  onRefresh,
  scrollable = true,
  containerStyle,
  contentStyle,
}) => {
  const globalStyles = useGlobalStyles();
  const { contentPaddingBottom } = useTabBarHeight();

  const Content = () => (
    <View style={[globalStyles.scrollContent, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[globalStyles.container, containerStyle]}>
      {showHeader && (
        <Header
          title={title}
          subtitle={subtitle}
          icon={icon}
          rightButton={rightButton}
          showBlur={showBlur}
        />
      )}
      
      {scrollable ? (
        <ScrollView
          style={globalStyles.scrollContent}
          contentContainerStyle={[
            { paddingBottom: contentPaddingBottom },
            contentStyle
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <Content />
      )}
    </View>
  );
};

export default Screen;
