import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { TabBarIcon } from '@/components/TabBarIcon';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();

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
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
          paddingBottom: 4,
          height: 60,
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
              size={26}
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
              size={26}
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
              size={26}
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
              size={26}
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
              size={26}
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
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
