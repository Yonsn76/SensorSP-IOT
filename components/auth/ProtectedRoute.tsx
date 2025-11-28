import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatedBackground } from '../ui/common';
import { useResponsive } from '../../hooks/useResponsive';

const isWeb = Platform.OS === 'web';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback
}) => {
  const { isAuthenticated } = useAuth();
  const { responsiveSizes, isSmallScreen, isMediumScreen, width: screenWidth } = useResponsive();

  // Permitir acceso si el usuario está autenticado
  const canAccess = isAuthenticated;

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const iconShakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const lockPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!canAccess) {
      // Animación de entrada secuencial
      Animated.parallel([
        // Fade in del contenido
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Scale del card
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Slide up del contenido
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotación continua del ícono de candado
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shake del ícono después de un delay
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(iconShakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(iconShakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(iconShakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(iconShakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

      // Pulse del candado
      Animated.loop(
        Animated.sequence([
          Animated.timing(lockPulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(lockPulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [canAccess]);

  // Interpolaciones
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const handleLoginPress = () => {
    router.push('/login');
  };

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Calcular ancho máximo responsive
    const maxWidth = isSmallScreen
      ? screenWidth - (responsiveSizes.spacingLarge * 2)
      : isMediumScreen
      ? Math.min(420, screenWidth - (responsiveSizes.spacingLarge * 2))
      : isWeb
      ? Math.min(480, screenWidth * 0.9)
      : Math.min(450, screenWidth - (responsiveSizes.spacingLarge * 2));

    // Padding responsive
    const cardPadding = isSmallScreen
      ? responsiveSizes.spacingLarge
      : isMediumScreen
      ? responsiveSizes.spacingXLarge
      : responsiveSizes.spacingXLarge * 1.25;

    // Tamaños adaptativos
    const iconSize = isSmallScreen ? 60 : isMediumScreen ? 80 : 100;
    const titleSize = isSmallScreen ? 24 : isMediumScreen ? 28 : 32;
    const subtitleSize = isSmallScreen ? 14 : isMediumScreen ? 16 : 18;

    // Border radius adaptativo
    const cardBorderRadius = isSmallScreen
      ? responsiveSizes.borderRadiusLarge
      : responsiveSizes.borderRadiusLarge * 1.5;

    return (
      <AnimatedBackground>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View
            style={[
              styles.contentWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  maxWidth,
                  padding: cardPadding,
                  borderRadius: cardBorderRadius,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Ícono de candado animado */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      { translateX: iconShakeAnim },
                      { scale: lockPulseAnim },
                      { rotate },
                    ],
                  },
                ]}
              >
                <View style={[styles.iconCircle, { width: iconSize + 20, height: iconSize + 20, borderRadius: (iconSize + 20) / 2 }]}>
                  <Ionicons
                    name="lock-closed"
                    size={iconSize}
                    color="#FF6B6B"
                  />
                </View>
              </Animated.View>

              {/* Título */}
              <Text
                style={[
                  styles.message,
                  {
                    fontSize: titleSize,
                    marginTop: responsiveSizes.spacingXLarge,
                    marginBottom: responsiveSizes.spacingMedium,
                  },
                ]}
              >
                Acceso no autorizado
              </Text>

              {/* Subtítulo */}
              <Text
                style={[
                  styles.subMessage,
                  {
                    fontSize: subtitleSize,
                    marginBottom: responsiveSizes.spacingXLarge * 2,
                    lineHeight: subtitleSize * 1.5,
                    paddingHorizontal: responsiveSizes.spacingSmall,
                  },
                ]}
              >
                Debes iniciar sesión para acceder a esta funcionalidad
              </Text>

              {/* Botón de inicio de sesión */}
              <Animated.View
                style={[
                  {
                    transform: [{ scale: buttonScaleAnim }],
                    width: '100%',
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    {
                      paddingVertical: responsiveSizes.spacingLarge,
                      paddingHorizontal: responsiveSizes.spacingXLarge * 2,
                      borderRadius: responsiveSizes.borderRadiusLarge,
                    },
                  ]}
                  onPress={handleLoginPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={responsiveSizes.iconMedium}
                    color="#FFFFFF"
                    style={{ marginRight: responsiveSizes.spacingSmall }}
                  />
                  <Text
                    style={[
                      styles.loginButtonText,
                      { fontSize: responsiveSizes.textMedium },
                    ]}
                  >
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Mensaje adicional */}
              <Text
                style={[
                  styles.hintText,
                  {
                    fontSize: responsiveSizes.textSmall,
                    marginTop: responsiveSizes.spacingLarge,
                  },
                ]}
              >
                ¿No tienes una cuenta?{' '}
                <Text
                  style={styles.hintLink}
                  onPress={() => router.push('/register')}
                >
                  Regístrate aquí
                </Text>
              </Text>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </AnimatedBackground>
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
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  hintLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
