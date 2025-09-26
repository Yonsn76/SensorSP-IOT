import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
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

export const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const { isDark } = useTheme();

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setError('');
    
    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
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
      marginBottom: 24,
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      textAlign: 'center',
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: isDark ? '#8E8E93' : '#6D6D70',
      textAlign: 'center',
      fontWeight: '400',
    },
    inputContainer: {
      width: '100%',
      marginBottom: 16,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 6,
    },
    inputWrapper: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      overflow: 'hidden',
    },
    input: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      backgroundColor: 'transparent',
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: 14,
      top: 12,
      padding: 4,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginBottom: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
    registerButton: {
      backgroundColor: isDark ? '#0A84FF' : '#007AFF',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: isDark ? '#0A84FF' : '#007AFF',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loginLink: {
      alignItems: 'center',
    },
    loginLinkText: {
      fontSize: 15,
      color: isDark ? '#8E8E93' : '#6D6D70',
      fontWeight: '400',
    },
    loginLinkButton: {
      marginTop: 4,
    },
    loginLinkButtonText: {
      fontSize: 15,
      color: isDark ? '#0A84FF' : '#007AFF',
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
                  <Text style={{ fontSize: 28, color: isDark ? '#FFFFFF' : '#1D1D1F' }}>⚡</Text>
                </View>
                <Text style={styles.title}>Crear Cuenta</Text>
                <Text style={styles.subtitle}>Únete a SensorSP</Text>
              </View>

              {/* Register Form */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre de Usuario</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu nombre de usuario"
                    placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                    value={formData.username}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu email"
                    placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
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
                      value={formData.password}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                        size={18} 
                        color={isDark ? '#8E8E93' : '#6D6D70'} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirma tu contraseña"
                      placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                        size={18} 
                        color={isDark ? '#8E8E93' : '#6D6D70'} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>


              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginLink}>
                <Text style={styles.loginLinkText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity 
                  style={styles.loginLinkButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.loginLinkButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>

            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
