import { BlurView } from 'expo-blur';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const LoadingScreen: React.FC = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F2F2F7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#F2F2F7',
    },
    floatingElements: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    floatingCircle1: {
      position: 'absolute',
      top: height * 0.2,
      left: width * 0.1,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    floatingCircle2: {
      position: 'absolute',
      top: height * 0.4,
      right: width * 0.1,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    glassCard: {
      borderRadius: 24,
      overflow: 'hidden',
      padding: 40,
      alignItems: 'center',
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: '#1D1D1F',
      marginBottom: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#6D6D70',
      textAlign: 'center',
      marginBottom: 24,
    },
    loadingText: {
      fontSize: 14,
      color: '#6D6D70',
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundGradient} />
      
      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <View style={styles.floatingCircle1} />
        <View style={styles.floatingCircle2} />
      </View>

      <BlurView
        intensity={30}
        tint="light"
        style={styles.glassCard}
      >
        <View style={styles.logo}>
          <Text style={{ fontSize: 32, color: '#1D1D1F' }}>⚡</Text>
        </View>
        <Text style={styles.title}>SensorSP</Text>
        <Text style={styles.subtitle}>Cargando...</Text>
        <ActivityIndicator 
          size="large" 
          color="#007AFF" 
        />
        <Text style={styles.loadingText}>Inicializando aplicación</Text>
      </BlurView>
    </View>
  );
};
