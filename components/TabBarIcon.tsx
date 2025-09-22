import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TabBarIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  size?: number;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ 
  iconName, 
  color, 
  focused, 
  size = 20 
}) => {
  // Convertir el nombre del icono para mostrar filled cuando está activo
  const getIconName = (name: string, isFocused: boolean) => {
    if (isFocused) {
      // Si está activo, usar la versión filled
      return name.replace('-outline', '') as keyof typeof Ionicons.glyphMap;
    }
    // Si está inactivo, usar la versión outline
    return name as keyof typeof Ionicons.glyphMap;
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      minHeight: 28,
      borderRadius: 12,
      backgroundColor: focused ? 'rgba(128, 128, 128, 0.15)' : 'transparent',
    },
    icon: {
      opacity: focused ? 1 : 0.5,
      transform: [{ scale: focused ? 1.1 : 1 }],
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons 
        name={getIconName(iconName, focused)} 
        size={size} 
        color={color} 
        style={styles.icon}
      />
    </View>
  );
};
