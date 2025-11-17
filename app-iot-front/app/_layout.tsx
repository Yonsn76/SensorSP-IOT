import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

  // Configurar la barra de navegación del sistema en Android al iniciar
  // Esta configuración inicial se sobrescribirá cuando el tema se cargue
  React.useEffect(() => {
    const configureInitialNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          // Configuración inicial por defecto (tema claro)
          // Se actualizará cuando el tema se cargue en AppContent
          await NavigationBar.setBackgroundColorAsync('#FFFFFF');
          await NavigationBar.setButtonStyleAsync('dark');
        } catch (error) {
          console.log('Error configurando la barra de navegación inicial:', error);
        }
      }
    };

    configureInitialNavigationBar();
  }, []);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}

// Componente interno que usa los hooks - definido DESPUÉS de RootLayout
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();

  console.log('🔍 AppContent - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // Configurar la barra de navegación del sistema en Android cuando cambia el tema
  React.useEffect(() => {
    const configureNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          // Pequeño delay para asegurar que el tema se haya aplicado correctamente
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (isDark) {
            // Tema oscuro: fondo negro, botones blancos (light)
            await NavigationBar.setBackgroundColorAsync('#000000');
            await NavigationBar.setButtonStyleAsync('light');
          } else {
            // Tema claro: fondo blanco, botones oscuros (dark)
            await NavigationBar.setBackgroundColorAsync('#FFFFFF');
            await NavigationBar.setButtonStyleAsync('dark');
          }
        } catch (error) {
          console.log('Error configurando la barra de navegación:', error);
        }
      }
    };
    
    configureNavigationBar();
  }, [isDark]);

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
