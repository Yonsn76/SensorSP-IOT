import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  // Permitir acceso si el usuario está autenticado
  const canAccess = isAuthenticated;

  const handleLoginPress = () => {
    router.push('/login');
  };

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.messageContainer}
        >
          <Text style={[styles.message, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Acceso no autorizado
          </Text>
          <Text style={[styles.subMessage, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Debes iniciar sesión para acceder a esta funcionalidad
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
            onPress={handleLoginPress}
          >
            <Text style={[styles.loginButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageContainer: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
