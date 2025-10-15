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

interface NeumorphicFormProps {
  onLogin: (username: string, password: string) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

export default function NeumorphicForm({
  onLogin,
  onSignUp,
  onForgotPassword,
  isLoading = false,
}: NeumorphicFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin(username, password);
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
      marginBottom: 40,
    },
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      backgroundColor: '#2C2C2C',
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 15,
      fontSize: 16,
      color: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
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
        <Text style={styles.title}>Iniciar Sesión</Text>
        
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

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>


        {isLoading && (
          <Text style={styles.loadingText}>Cargando...</Text>
        )}
      </View>
    </View>
  );
}
