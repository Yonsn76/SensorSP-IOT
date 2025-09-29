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
      paddingVertical: 6,
      paddingHorizontal: 10,
      minHeight: 24,
      borderRadius: 14,
      backgroundColor: focused ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
      shadowColor: focused ? '#007AFF' : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: focused ? 0.25 : 0,
      shadowRadius: focused ? 4 : 0,
      elevation: focused ? 3 : 0,
      borderWidth: focused ? 1 : 0,
      borderColor: focused ? 'rgba(0, 122, 255, 0.3)' : 'transparent',
    },
    icon: {
      opacity: focused ? 1 : 0.6,
      transform: [{ scale: focused ? 1.1 : 1 }],
      marginBottom: 2,
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
