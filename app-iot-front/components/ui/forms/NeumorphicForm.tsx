import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../../hooks/useResponsive';

const isWeb = Platform.OS === 'web';

interface NeumorphicFormProps {
  onLogin: (username: string, password: string) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function NeumorphicForm({
  onLogin,
  onSignUp,
  onForgotPassword,
  isLoading = false,
  error,
}: NeumorphicFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { responsiveSizes, isSmallScreen, isMediumScreen, width: screenWidth, height: screenHeight } = useResponsive();

  const handleLogin = () => {
    onLogin(email, password);
  };

  // Calcular valores adaptativos basados en el ancho de pantalla
  const horizontalPadding = isSmallScreen 
    ? responsiveSizes.spacingMedium 
    : isMediumScreen 
    ? responsiveSizes.spacingLarge 
    : responsiveSizes.spacingXLarge;

  const verticalPadding = isSmallScreen 
    ? responsiveSizes.spacingLarge 
    : isMediumScreen 
    ? responsiveSizes.spacingXLarge 
    : responsiveSizes.spacingXLarge * 1.5;

  // Ancho máximo del card adaptativo
  const maxWidth = isSmallScreen 
    ? screenWidth - (horizontalPadding * 2)
    : isMediumScreen 
    ? Math.min(420, screenWidth - (horizontalPadding * 2))
    : isWeb 
    ? Math.min(480, screenWidth * 0.9)
    : Math.min(450, screenWidth - (horizontalPadding * 2));

  // Padding del card adaptativo
  const cardPadding = isSmallScreen 
    ? responsiveSizes.spacingLarge 
    : isMediumScreen 
    ? responsiveSizes.spacingXLarge 
    : responsiveSizes.spacingXLarge * 1.25;

  // Tamaño del logo adaptativo
  const logoSize = isSmallScreen ? 50 : isMediumScreen ? 60 : 70;
  const logoImageSize = isSmallScreen ? 35 : isMediumScreen ? 40 : 45;

  // Border radius adaptativo
  const cardBorderRadius = isSmallScreen 
    ? responsiveSizes.borderRadiusLarge 
    : responsiveSizes.borderRadiusLarge * 1.5;

  // Espaciado entre elementos
  const elementSpacing = isSmallScreen 
    ? responsiveSizes.spacingMedium 
    : responsiveSizes.spacingLarge;

  // Logo usando la imagen real
  const LogoIcon = () => (
    <View style={[styles.logoContainer, { marginBottom: elementSpacing }]}>
      <View style={[styles.logoSquare, { 
        width: logoSize, 
        height: logoSize,
        borderRadius: responsiveSizes.borderRadiusMedium 
      }]}>
        <Image
          source={require('../../../assets/images/tem_icon.png')}
          style={[styles.logoImage, { width: logoImageSize, height: logoImageSize }]}
          contentFit="contain"
        />
      </View>
    </View>
  );

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollContainer,
        { 
          paddingHorizontal: horizontalPadding,
          paddingVertical: isSmallScreen ? responsiveSizes.spacingMedium : responsiveSizes.spacingLarge,
          minHeight: screenHeight,
        }
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 30 : 20}
        tint="dark"
        style={[
          styles.card, 
          { 
            maxWidth, 
            padding: cardPadding,
            borderRadius: cardBorderRadius,
            width: '100%',
          }
        ]}
      >
        {/* Logo */}
        <LogoIcon />

        {/* Title */}
        <Text style={[
          styles.title, 
          { 
            fontSize: isSmallScreen 
              ? responsiveSizes.textLarge + 4 
              : responsiveSizes.textXLarge + 8,
            marginBottom: responsiveSizes.spacingSmall,
          }
        ]}>
          Bienvenido de nuevo
        </Text>

        {/* Subtitle */}
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: responsiveSizes.textSmall,
            marginBottom: elementSpacing * 1.5,
            lineHeight: responsiveSizes.textSmall * 1.5,
            paddingHorizontal: isSmallScreen ? responsiveSizes.spacingSmall : 0,
          }
        ]}>
          Inicia sesión para acceder a tu panel de control de sensores IoT
        </Text>

        {/* Email Input */}
        <View style={[styles.inputWrapper, { marginBottom: elementSpacing }]}>
          <Text style={[
            styles.label, 
            { 
              fontSize: responsiveSizes.textSmall,
              marginBottom: responsiveSizes.spacingSmall,
            }
          ]}>
            Correo electrónico
          </Text>
          <View style={[
            styles.inputContainer,
            {
              paddingHorizontal: responsiveSizes.spacingLarge,
              paddingVertical: isSmallScreen ? responsiveSizes.spacingMedium : responsiveSizes.spacingLarge,
              borderRadius: responsiveSizes.borderRadiusMedium,
            }
          ]}>
            <Ionicons name="mail-outline" size={responsiveSizes.iconMedium} color="#FFFFFF" />
            <TextInput
              style={[
                styles.input, 
                { 
                  fontSize: responsiveSizes.textMedium,
                  marginLeft: responsiveSizes.spacingSmall,
                }
              ]}
              placeholder="tu@email.com"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={[styles.inputWrapper, { marginBottom: elementSpacing }]}>
          <Text style={[
            styles.label, 
            { 
              fontSize: responsiveSizes.textSmall,
              marginBottom: responsiveSizes.spacingSmall,
            }
          ]}>
            Contraseña
          </Text>
          <View style={[
            styles.inputContainer,
            {
              paddingHorizontal: responsiveSizes.spacingLarge,
              paddingVertical: isSmallScreen ? responsiveSizes.spacingMedium : responsiveSizes.spacingLarge,
              borderRadius: responsiveSizes.borderRadiusMedium,
            }
          ]}>
            <Ionicons name="lock-closed-outline" size={responsiveSizes.iconMedium} color="#FFFFFF" />
            <TextInput
              style={[
                styles.input, 
                { 
                  fontSize: responsiveSizes.textMedium,
                  marginLeft: responsiveSizes.spacingSmall,
                }
              ]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={responsiveSizes.iconMedium}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember me and Forget Password */}
        <View style={[
          styles.rememberRow,
          { 
            marginBottom: elementSpacing,
            flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
          }
        ]}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox, 
              { 
                width: isSmallScreen ? 18 : 20,
                height: isSmallScreen ? 18 : 20,
                marginRight: responsiveSizes.spacingSmall,
              },
              rememberMe && styles.checkboxChecked
            ]}>
              {rememberMe && (
                <Ionicons 
                  name="checkmark" 
                  size={isSmallScreen ? 14 : 16} 
                  color="#000000" 
                />
              )}
            </View>
            <Text style={[
              styles.rememberText, 
              { 
                fontSize: responsiveSizes.textSmall,
              }
            ]}>
              Recordarme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onForgotPassword}
            activeOpacity={0.7}
            style={isSmallScreen ? { marginTop: responsiveSizes.spacingSmall } : {}}
          >
            <Text style={[
              styles.forgetText, 
              { 
                fontSize: responsiveSizes.textSmall,
              }
            ]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[
            styles.signInButton,
            {
              paddingVertical: isSmallScreen 
                ? responsiveSizes.spacingLarge 
                : responsiveSizes.spacingLarge * 1.1,
              paddingHorizontal: responsiveSizes.spacingXLarge,
              borderRadius: responsiveSizes.borderRadiusMedium,
              marginBottom: elementSpacing,
            }
          ]}
          onPress={handleLogin}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          <Text style={[
            styles.signInButtonText, 
            { 
              fontSize: responsiveSizes.textMedium,
              marginRight: responsiveSizes.spacingSmall,
            }
          ]}>
            Iniciar Sesión
          </Text>
          <Ionicons name="arrow-forward" size={responsiveSizes.iconMedium} color="#000000" />
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
          <View style={[
            styles.errorContainer,
            {
              padding: responsiveSizes.spacingMedium,
              borderRadius: responsiveSizes.borderRadiusSmall,
              marginBottom: elementSpacing,
            }
          ]}>
            <Text style={[
              styles.errorText, 
              { 
                fontSize: responsiveSizes.textSmall,
              }
            ]}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Sign Up Link */}
        <View style={[
          styles.signUpRow,
          { marginTop: isSmallScreen ? responsiveSizes.spacingSmall : 0 }
        ]}>
          <Text style={[
            styles.signUpText, 
            { 
              fontSize: responsiveSizes.textSmall,
            }
          ]}>
            ¿No tienes una cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
            <Text style={[
              styles.signUpLink, 
              { 
                fontSize: responsiveSizes.textSmall,
              }
            ]}>
              Crear una cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <Text style={[
            styles.loadingText, 
            { 
              fontSize: responsiveSizes.textSmall,
              marginTop: elementSpacing,
            }
          ]}>
            Cargando...
          </Text>
        )}
      </BlurView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    maxWidth: '100%',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoSquare: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    // Tamaño dinámico aplicado en el componente
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    width: '100%',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    padding: 0,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  rememberText: {
    color: '#FFFFFF',
    flexShrink: 1,
  },
  forgetText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    flexShrink: 1,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  signInButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  signUpText: {
    color: '#FFFFFF',
  },
  signUpLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    width: '100%',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.4)',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '500',
  },
});
