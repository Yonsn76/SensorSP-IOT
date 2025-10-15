import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { NeumorphicForm } from '../ui/forms';
import { AnimatedBackground } from '../ui/common';

export const LoginScreen: React.FC = () => {
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    try {
      setError('');
      await login({ email: username, password });
      router.replace('/(tabs)');
    } catch (err) {
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Por favor contacta al administrador para recuperar tu contraseña.',
      [{ text: 'OK' }]
    );
  };

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <NeumorphicForm
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
        />
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ff7c90',
    borderRadius: 8,
    maxWidth: 300,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default LoginScreen;