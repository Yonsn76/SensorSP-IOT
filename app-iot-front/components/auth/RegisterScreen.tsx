import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { NeumorphicRegisterForm } from '../ui/forms';
import { AnimatedBackground } from '../ui/common';

export const RegisterScreen: React.FC = () => {
  const [error, setError] = useState('');
  const { register, isLoading, isAuthenticated } = useAuth();

  // Navegar automáticamente después del registro exitoso
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Registro exitoso, navegando a la aplicación principal');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleRegister = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      setError('');
      
      // Validaciones básicas
      if (!username || !email || !password || !confirmPassword) {
        setError('Todos los campos son obligatorios');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Validación de email más estricta
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Por favor ingresa un email válido');
        return;
      }

      if (username.length < 3) {
        setError('El nombre de usuario debe tener al menos 3 caracteres');
        return;
      }

      // Llamar a la función de registro del AuthContext
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password
      });

      // Si llegamos aquí, el registro fue exitoso
      // El AuthContext ya maneja la navegación automática
      
    } catch (err: any) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al crear la cuenta. Por favor, inténtalo de nuevo.');
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <NeumorphicRegisterForm
          onRegister={handleRegister}
          onLogin={handleLogin}
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

export default RegisterScreen;