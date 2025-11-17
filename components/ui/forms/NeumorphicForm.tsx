import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sharedFormStyles } from './sharedStyles';

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

  const styles = sharedFormStyles;

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
