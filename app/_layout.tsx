import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { LoadingScreen } from '../components/LoadingScreen';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';
import { WidgetDataProvider } from '../widgets';

// Componente principal con providers
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Inicializar notificaciones de forma segura
  React.useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.requestPermissions();
        console.log('Servicio de notificaciones inicializado');
      } catch (error) {
        console.log(' Notificaciones no disponibles (normal en Expo Go)');
      }
    };

    initNotifications();
  }, []);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CustomThemeProvider>
  );
}

// Componente interno que usa los hooks - definido DESPUÉS de RootLayout
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();

  console.log('🔍 AppContent - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <WidgetDataProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
            </>
          )}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </WidgetDataProvider>
  );
}
