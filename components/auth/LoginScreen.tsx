import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <NeumorphicForm
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
          error={error}
        />
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};

export default LoginScreen;