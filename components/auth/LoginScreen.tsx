import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { NeumorphicForm, sharedFormStyles } from '../ui/forms';
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

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  errorContainer: sharedFormStyles.errorContainer,
  errorText: sharedFormStyles.errorText,
};

export default LoginScreen;