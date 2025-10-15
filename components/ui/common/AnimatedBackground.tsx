import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const animatedValues = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.parallel(animations).start();
  }, []);

  const renderFloatingShapes = () => {
    return animatedValues.map((value, index) => {
      const size = 20 + (index % 5) * 15;
      const left = (index * width) / animatedValues.length;
      const top = (index * height) / animatedValues.length;
      
      const translateY = value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50 - index * 10],
      });

      const translateX = value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 30 + index * 5],
      });

      const rotate = value.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

      const opacity = value.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.1, 0.3, 0.1],
      });

      const scale = value.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.8, 1.2, 0.8],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.floatingShape,
            {
              left,
              top,
              width: size,
              height: size,
              transform: [
                { translateY },
                { translateX },
                { rotate },
                { scale },
              ],
              opacity,
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <View style={styles.gradientBackground} />
      
      {/* Floating Shapes */}
      {renderFloatingShapes()}
      
      {/* Grid Pattern */}
      <View style={styles.gridPattern} />
      
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
    backgroundColor: '#0F0F0F',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F0F0F',
  },
  floatingShape: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderRadius: 50,
    shadowColor: '#16213E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
    // Grid pattern would be implemented with SVG or custom drawing
  },
});

export default AnimatedBackground;
