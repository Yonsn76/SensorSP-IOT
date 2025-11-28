import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { TabBarIcon } from '@/components/TabBarIcon';
import { TabBarBackground } from '@/components/ui/common';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';

export default function TabLayout() {
  const { isDark } = useTheme();
  const { responsiveSizes, isSmallScreen } = useResponsive();
  const insets = useSafeAreaInsets();
  
  // Calcular padding bottom para Android - asegurar que el TabBar esté por encima de los botones del sistema
  // En Android con botones de navegación tradicionales, insets.bottom puede ser 0
  // Necesitamos un padding mínimo para evitar que quede detrás de los botones del sistema
  const minBottomPaddingAndroid = 20; // Padding mínimo para botones de navegación en Android (48dp es el estándar, pero usamos menos)
  const basePadding = responsiveSizes.spacingSmall;
  
  // Padding bottom que respeta el safe area y asegura espacio para los botones del sistema
  const safeAreaBottomPadding = Platform.OS === 'android' 
    ? Math.max(insets.bottom, minBottomPaddingAndroid) + basePadding
    : Math.max(insets.bottom, 0) + basePadding;
  
  // Altura base del contenido interno del tab bar (optimizada para iconos responsive)
  const baseContentHeight = isSmallScreen ? 40 : 44;
  
  // Altura total del tab bar = altura del contenido + padding top + padding bottom
  // Nota: En React Navigation, el height incluye el padding, así que sumamos todo
  const tabBarHeight = baseContentHeight + responsiveSizes.spacingSmall + safeAreaBottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: isDark ? '#666666' : '#999999',
        headerShown: false,
        headerStyle: { display: 'none' },
        header: () => null,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 10 : 11,
          fontWeight: '500',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: responsiveSizes.spacingSmall,
          paddingBottom: safeAreaBottomPadding,
          paddingHorizontal: 8,
          height: tabBarHeight,
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
          headerStyle: { display: 'none' },
          header: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              iconName="grid-outline" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historics"
        options={{
          title: 'Históricos',
          headerShown: false,
          headerStyle: { display: 'none' },
          header: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              iconName="analytics-outline" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Registros',
          headerShown: false,
          headerStyle: { display: 'none' },
          header: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              iconName="list-outline" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sensors"
        options={{
          title: 'Sensores',
          headerShown: false,
          headerStyle: { display: 'none' },
          header: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              iconName="hardware-chip-outline" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Avisos',
          headerShown: false,
          headerStyle: { display: 'none' },
          header: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              iconName="notifications-outline" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          headerShown: false,
          headerStyle: { display: 'none' },
          header: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              iconName="settings-outline" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
