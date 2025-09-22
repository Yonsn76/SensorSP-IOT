import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { isDark } = useTheme();

  const handleSubmit = async () => {
    if (!credentials.email || !credentials.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    
    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    floatingElements: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    floatingCircle1: {
      position: 'absolute',
      top: height * 0.1,
      left: width * 0.1,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.1)',
    },
    floatingCircle2: {
      position: 'absolute',
      top: height * 0.3,
      right: width * 0.1,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 59, 48, 0.1)',
    },
    floatingCircle3: {
      position: 'absolute',
      bottom: height * 0.2,
      left: width * 0.2,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? 'rgba(88, 86, 214, 0.1)' : 'rgba(88, 86, 214, 0.1)',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    glassCard: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 20,
    },
    glassContent: {
      padding: 32,
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 17,
      color: isDark ? '#8E8E93' : '#6D6D70',
      textAlign: 'center',
      fontWeight: '400',
    },
    inputContainer: {
      width: '100%',
      marginBottom: 20,
    },
    label: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 8,
    },
    inputWrapper: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      overflow: 'hidden',
    },
    input: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 17,
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      backgroundColor: 'transparent',
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: 16,
      top: 14,
      padding: 4,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 15,
      marginBottom: 20,
      textAlign: 'center',
      fontWeight: '500',
    },
    loginButton: {
      backgroundColor: isDark ? '#0A84FF' : '#007AFF',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: isDark ? '#0A84FF' : '#007AFF',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
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
        <View style={styles.floatingCircle3} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="height"
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BlurView
            intensity={isDark ? 20 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={styles.glassCard}
          >
            <View style={styles.glassContent}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={{ fontSize: 32, color: isDark ? '#FFFFFF' : '#1D1D1F' }}>⚡</Text>
                </View>
                <Text style={styles.title}>SensorSP</Text>
                <Text style={styles.subtitle}>Monitoreo inteligente</Text>
              </View>

              {/* Login Form */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu email"
                    placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                    value={credentials.email}
                    onChangeText={(text) => setCredentials(prev => ({ ...prev, email: text }))}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                      value={credentials.password}
                      onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={{ color: isDark ? '#8E8E93' : '#6D6D70', fontSize: 20 }}>
                        {showPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
