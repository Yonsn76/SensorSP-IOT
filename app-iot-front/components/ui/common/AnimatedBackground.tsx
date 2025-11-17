import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  // Valores animados para las luces cálidas
  const light1 = useRef(new Animated.Value(0)).current;
  const light2 = useRef(new Animated.Value(0)).current;
  const light3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación continua para las luces cálidas (naranja, amarillo, rojo)
    const createPulseAnimation = (value: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const anim1 = createPulseAnimation(light1, 0);
    const anim2 = createPulseAnimation(light2, 1300);
    const anim3 = createPulseAnimation(light3, 2600);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  // Interpolaciones para las posiciones y opacidades de las luces
  const light1Opacity = light1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const light2Opacity = light2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.5, 0.2],
  });

  const light3Opacity = light3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.25, 0.55, 0.25],
  });

  const light1Scale = light1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const light2Scale = light2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const light3Scale = light3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  return (
    <View style={styles.container}>
      {/* Fondo base oscuro */}
      <View style={styles.baseBackground} />
      
      {/* Luces cálidas animadas */}
      <Animated.View
        style={[
          styles.light1,
          {
            opacity: light1Opacity,
            transform: [{ scale: light1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.light2,
          {
            opacity: light2Opacity,
            transform: [{ scale: light2Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.light3,
          {
            opacity: light3Opacity,
            transform: [{ scale: light3Scale }],
          },
        ]}
      />
      
      {/* Overlay oscuro semi-transparente para el efecto difuminado */}
      <View style={styles.darkOverlay} />
      
      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  baseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0A0A',
  },
  light1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#FF6B35', // Naranja
    top: -width * 0.3,
    right: -width * 0.2,
    // Blur effect usando shadow
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    ...(Platform.OS === 'web' && {
      filter: 'blur(80px)',
    }),
  },
  light2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#FFD23F', // Amarillo
    bottom: -width * 0.2,
    left: -width * 0.15,
    shadowColor: '#FFD23F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    ...(Platform.OS === 'web' && {
      filter: 'blur(70px)',
    }),
  },
  light3: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#FF4757', // Rojo
    top: height * 0.3,
    left: width * 0.1,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 90,
    ...(Platform.OS === 'web' && {
      filter: 'blur(75px)',
    }),
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay oscuro para difuminar
  },
});

export default AnimatedBackground;
