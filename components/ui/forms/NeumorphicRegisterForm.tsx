import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface NeumorphicRegisterFormProps {
  onRegister: (username: string, email: string, password: string, confirmPassword: string) => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

export default function NeumorphicRegisterForm({
  onRegister,
  onLogin,
  onForgotPassword,
  isLoading = false,
}: NeumorphicRegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Validaciones básicas antes de enviar
    if (!username.trim()) {
      alert('El nombre de usuario es requerido');
      return;
    }
    
    if (!email.trim()) {
      alert('El email es requerido');
      return;
    }
    
    if (!password) {
      alert('La contraseña es requerida');
      return;
    }
    
    if (!confirmPassword) {
      alert('La confirmación de contraseña es requerida');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!email.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }
    
    if (username.length < 3) {
      alert('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    
    onRegister(username, email, password, confirmPassword);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 350,
      backgroundColor: '#2D2D2D',
      borderRadius: 25,
      padding: 30,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 20,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 15,
    },
    inputWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3A3A3A',
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 15,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
    inputText: {
      flex: 1,
      fontSize: 16,
      color: '#FFFFFF',
      marginLeft: 10,
    },
    icon: {
      color: '#888888',
      fontSize: 18,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    button: {
      flex: 1,
      backgroundColor: '#4A4A4A',
      borderRadius: 15,
      paddingVertical: 15,
      paddingHorizontal: 20,
      marginHorizontal: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    buttonDisabled: {
      backgroundColor: '#2A2A2A',
      opacity: 0.6,
    },
    buttonTextDisabled: {
      color: '#666666',
    },
    loadingText: {
      color: '#888888',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registrarse</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWithIcon}>
            <Text style={styles.icon}>@</Text>
            <TextInput
              style={styles.inputText}
              placeholder="Usuario"
              placeholderTextColor="#888888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWithIcon}>
            <Ionicons name="mail" size={18} color="#888888" />
            <TextInput
              style={styles.inputText}
              placeholder="Correo electrónico"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWithIcon}>
            <Ionicons name="lock-closed" size={18} color="#888888" />
            <TextInput
              style={styles.inputText}
              placeholder="Contraseña"
              placeholderTextColor="#888888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWithIcon}>
            <Ionicons name="lock-closed" size={18} color="#888888" />
            <TextInput
              style={styles.inputText}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#888888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
              {isLoading ? 'Creando...' : 'Registrarse'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={onLogin}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
        </View>


        {isLoading && (
          <Text style={styles.loadingText}>Creando cuenta...</Text>
        )}
      </View>
    </View>
  );
}
