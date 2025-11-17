import { Link, Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/ui/common';
import { useResponsive } from '@/hooks/useResponsive';

export default function NotFoundScreen() {
  const router = useRouter();
  const { responsiveSizes, isSmallScreen, isMediumScreen } = useResponsive();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const iconBounceAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada secuencial
    Animated.parallel([
      // Fade in del contenido
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale del número 404
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Slide up del texto
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotación continua del ícono
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bounce del ícono
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(iconBounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolaciones
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconTranslateY = iconBounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  });

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

  const handleGoHome = () => {
    router.push('/');
  };

  // Tamaños adaptativos
  const errorCodeSize = isSmallScreen ? 80 : isMediumScreen ? 100 : 120;
  const iconSize = isSmallScreen ? 60 : isMediumScreen ? 80 : 100;
  const titleSize = isSmallScreen ? 24 : isMediumScreen ? 28 : 32;
  const subtitleSize = isSmallScreen ? 14 : isMediumScreen ? 16 : 18;

  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada', headerShown: false }} />
      <AnimatedBackground>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            {/* Ícono animado */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [
                    { translateY: iconTranslateY },
                    { rotate },
                  ],
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={iconSize}
                color="#FFFFFF"
              />
            </Animated.View>

            {/* Número 404 animado */}
            <Animated.View
              style={[
                styles.errorCodeContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={[styles.errorCode, { fontSize: errorCodeSize }]}>
                404
              </Text>
            </Animated.View>

            {/* Título */}
            <Text
              style={[
                styles.title,
                {
                  fontSize: titleSize,
                  marginTop: responsiveSizes.spacingXLarge,
                  marginBottom: responsiveSizes.spacingMedium,
                },
              ]}
            >
              Página no encontrada
            </Text>

            {/* Descripción */}
            <Text
              style={[
                styles.description,
                {
                  fontSize: subtitleSize,
                  marginBottom: responsiveSizes.spacingXLarge * 2,
                  paddingHorizontal: responsiveSizes.spacingLarge,
                },
              ]}
            >
              Lo sentimos, la página que estás buscando no existe o ha sido
              movida.
            </Text>

            {/* Botón para volver al inicio */}
            <Animated.View
              style={[
                {
                  transform: [{ scale: buttonScaleAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    paddingVertical: responsiveSizes.spacingLarge,
                    paddingHorizontal: responsiveSizes.spacingXLarge * 2,
                    borderRadius: responsiveSizes.borderRadiusLarge,
                    marginBottom: responsiveSizes.spacingMedium,
                  },
                ]}
                onPress={handleGoHome}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
              >
                <Ionicons
                  name="home"
                  size={responsiveSizes.iconMedium}
                  color="#000000"
                  style={{ marginRight: responsiveSizes.spacingSmall }}
                />
                <Text
                  style={[
                    styles.buttonText,
                    { fontSize: responsiveSizes.textMedium },
                  ]}
                >
                  Volver al inicio
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Link alternativo */}
            <Link href="/" asChild>
              <TouchableOpacity
                style={[
                  styles.linkButton,
                  { paddingVertical: responsiveSizes.spacingSmall },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.linkText,
                    { fontSize: responsiveSizes.textSmall },
                  ]}
                >
                  Ir a la pantalla principal
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
      </AnimatedBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCode: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 4,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
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
  buttonText: {
    color: '#000000',
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
