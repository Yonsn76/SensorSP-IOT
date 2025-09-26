import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AdvancedExportModal from '../../components/AdvancedExportModal';
import ExportModal from '../../components/ExportModal';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  
  // Estados básicos
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataRetention, setDataRetention] = useState(30);
  const [language, setLanguage] = useState('es');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvancedExportModal, setShowAdvancedExportModal] = useState(false);
  
  // Estados de notificaciones
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Estados de datos
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5); // minutos
  
  
  // Estados de modales
  const [showDataRetentionModal, setShowDataRetentionModal] = useState(false);
  const [showSyncIntervalModal, setShowSyncIntervalModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationRulesModal, setShowNotificationRulesModal] = useState(false);
  
  // Estados temporales para modales
  const [tempDataRetention, setTempDataRetention] = useState(30);
  const [tempSyncInterval, setTempSyncInterval] = useState(5);
  const [tempLanguage, setTempLanguage] = useState('es');

  // Cargar configuraciones guardadas
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setAutoRefresh(parsedSettings.autoRefresh ?? true);
        setDataRetention(parsedSettings.dataRetention ?? 30);
        setLanguage(parsedSettings.language ?? 'es');
        setPushNotifications(parsedSettings.pushNotifications ?? true);
        setSoundEnabled(parsedSettings.soundEnabled ?? true);
        setVibrationEnabled(parsedSettings.vibrationEnabled ?? true);
        setAutoSync(parsedSettings.autoSync ?? true);
        setSyncInterval(parsedSettings.syncInterval ?? 5);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        autoRefresh,
        dataRetention,
        language,
        pushNotifications,
        soundEnabled,
        vibrationEnabled,
        autoSync,
        syncInterval,
      };
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Guardar configuraciones cuando cambien
  useEffect(() => {
    saveSettings();
  }, [
    autoRefresh, dataRetention, language, pushNotifications,
    soundEnabled, vibrationEnabled,
    autoSync, syncInterval,
  ]);

  const handleLogout = async () => {
    console.log(' handleLogout() llamada - Mostrando alerta de confirmación');
    
    try {
      console.log('🔄 Creando alerta de confirmación...');
      
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => {
              console.log('  Usuario canceló el logout');
            }
          },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: async () => {
              console.log('   Usuario confirmó el logout - Iniciando proceso...');
              try {
                console.log('🔄 Llamando a logout() del AuthContext...');
                await logout();
                console.log('   Logout del AuthContext completado exitosamente');
                
                // Navegar explícitamente al login
                console.log('🔄 Intentando navegar al login con router.replace...');
                router.replace('/login');
                console.log('   Navegación al login ejecutada');
              } catch (error) {
                console.error('  Error en logout:', error);
                console.log('🔄 Intentando navegar al login a pesar del error...');
                // Aún así, intentar navegar al login
                router.replace('/login');
                console.log('   Navegación al login ejecutada (después de error)');
              }
            }
          }
        ],
        { cancelable: true }
      );
      
      console.log('   Alerta de confirmación mostrada');
    } catch (error) {
      console.error('  Error al mostrar alerta:', error);
      // Si hay error con la alerta, hacer logout directo
      console.log('🔄 Haciendo logout directo sin confirmación...');
      try {
        await logout();
        router.replace('/login');
        console.log('   Logout directo completado');
      } catch (logoutError) {
        console.error('  Error en logout directo:', logoutError);
      }
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
  };


  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português'
    };
    return languages[code] || 'Español';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 17,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '400',
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 20,
      // Liquid Glass effect 100% Apple
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      // Shadow for depth - Liquid Glass
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
      // Backdrop blur effect
      backdropFilter: 'blur(20px)',
    },
    sectionContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: 17,
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      fontWeight: '400',
    },
    settingValue: {
      fontSize: 17,
      color: isDark ? '#FFFFFF' : '#000000',
      marginRight: 10,
      fontWeight: '400',
    },
    userInfo: {
      alignItems: 'center',
      padding: 20,
    },
    userAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    },
    userAvatarText: {
      fontSize: 32,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    userName: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 15,
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
      fontWeight: '400',
    },
    userRole: {
      fontSize: 13,
      color: isDark ? '#FFFFFF' : '#000000',
      textTransform: 'uppercase',
      fontWeight: '500',
    },
    themeButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    themeButtonActive: {
      backgroundColor: isDark ? '#FFFFFF' : '#000000',
    },
    themeButtonInactive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    themeButtonText: {
      fontSize: 15,
      fontWeight: '500',
    },
    themeButtonTextActive: {
      color: isDark ? '#000000' : '#FFFFFF',
    },
    themeButtonTextInactive: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    logoutButton: {
      backgroundColor: isDark ? '#FFFFFF' : '#000000',
      borderRadius: 24,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      // Shadow for depth - Liquid Glass
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
    logoutButtonText: {
      color: isDark ? '#000000' : '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
    },
    versionInfo: {
      alignItems: 'center',
      padding: 20,
    },
    versionText: {
      fontSize: 13,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '400',
    },
  });

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>
          Personaliza tu experiencia
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>👤</Text>
              </View>
              <Text style={styles.userName}>{user?.username || 'Cargando...'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'Cargando...'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Cargando...'}</Text>
            </View>
          </View>
        </BlurView>

        {/* Appearance */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Apariencia</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Tema</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    themeMode === 'light' ? styles.themeButtonActive : styles.themeButtonInactive,
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      themeMode === 'light' ? styles.themeButtonTextActive : styles.themeButtonTextInactive,
                    ]}
                  >
                    Claro
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    themeMode === 'dark' ? styles.themeButtonActive : styles.themeButtonInactive,
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      themeMode === 'dark' ? styles.themeButtonTextActive : styles.themeButtonTextInactive,
                    ]}
                  >
                    Oscuro
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    themeMode === 'system' ? styles.themeButtonActive : styles.themeButtonInactive,
                  ]}
                  onPress={() => handleThemeChange('system')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      themeMode === 'system' ? styles.themeButtonTextActive : styles.themeButtonTextInactive,
                    ]}
                  >
                    Sistema
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>

        {/* Data & Sync */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Datos y Sincronización</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Actualización Automática</Text>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                trackColor={{ false: '#767577', true: isDark ? '#FFFFFF' : '#000000' }}
                thumbColor={autoRefresh ? (isDark ? '#000000' : '#FFFFFF') : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sincronización Automática</Text>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#767577', true: isDark ? '#FFFFFF' : '#000000' }}
                thumbColor={autoSync ? (isDark ? '#000000' : '#FFFFFF') : '#f4f3f4'}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                setTempSyncInterval(syncInterval);
                setShowSyncIntervalModal(true);
              }}
            >
              <Text style={styles.settingLabel}>Intervalo de Sincronización</Text>
              <Text style={styles.settingValue}>{syncInterval} min</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                setTempDataRetention(dataRetention);
                setShowDataRetentionModal(true);
              }}
            >
              <Text style={styles.settingLabel}>Retención de Datos</Text>
              <Text style={styles.settingValue}>{dataRetention} días</Text>
            </TouchableOpacity>
            
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={() => {
                setTempLanguage(language);
                setShowLanguageModal(true);
              }}
            >
              <Text style={styles.settingLabel}>Idioma</Text>
              <Text style={styles.settingValue}>{getLanguageName(language)}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Notifications */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notificaciones Push</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#767577', true: isDark ? '#FFFFFF' : '#000000' }}
                thumbColor={pushNotifications ? (isDark ? '#000000' : '#FFFFFF') : '#f4f3f4'}
              />
            </View>
            
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sonido</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#FFFFFF' : '#000000' }}
                thumbColor={soundEnabled ? (isDark ? '#000000' : '#FFFFFF') : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <Text style={styles.settingLabel}>Vibración</Text>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#FFFFFF' : '#000000' }}
                thumbColor={vibrationEnabled ? (isDark ? '#000000' : '#FFFFFF') : '#f4f3f4'}
              />
            </View>
            
          </View>
        </BlurView>


        {/* Información de permisos para usuarios */}
        {user?.role === 'user' && (
          <BlurView
            intensity={isDark ? 20 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Información de Usuario</Text>
              <Text style={[styles.settingLabel, { textAlign: 'center', marginBottom: 0 }]}>
                Como usuario estándar, tienes acceso a las funciones básicas de monitoreo. 
                Para acceder a configuraciones avanzadas del sistema, contacta a un administrador.
              </Text>
            </View>
          </BlurView>
        )}

        {/* Exportación de Datos */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cloud-upload-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Exportación de Datos
            </Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowExportModal(true)}
            >
              <Text style={styles.settingLabel}>Exportación Básica</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={() => setShowAdvancedExportModal(true)}
            >
              <Text style={styles.settingLabel}>Exportación Avanzada</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Acerca de */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="information-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Acerca de
            </Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'SensorSP - Información',
                  '🌡️ Aplicación de Monitoreo IoT\n\n' +
                  ' Versión: 2025.1.0\n' +
                  '🏗️ Plataforma: React Native + Expo\n' +
                  '📅 Última actualización: Enero 2025\n\n' +
                  '👨‍💻 Desarrollado por: Yonsn76\n' +
                  '📧 Contacto: yonsn76@example.com\n\n' +
                  '🔧 Funcionalidades:\n' +
                  '• Monitoreo en tiempo real\n' +
                  '• Alertas inteligentes\n' +
                  '• Exportación de datos\n' +
                  '• Interfaz Liquid Glass'
                );
              }}
            >
              <Text style={styles.settingLabel}>Información de la App</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Términos y Condiciones',
                  '📋 TÉRMINOS Y CONDICIONES DE USO\n\n' +
                  '1. ACEPTACIÓN DE TÉRMINOS\n' +
                  'Al usar SensorSP, aceptas estos términos.\n\n' +
                  '2. USO PERMITIDO\n' +
                  '• Monitoreo de sensores IoT\n' +
                  '• Gestión de alertas\n' +
                  '• Exportación de datos\n\n' +
                  '3. PROHIBICIONES\n' +
                  '• Uso comercial no autorizado\n' +
                  '• Modificación del código\n' +
                  '• Distribución no autorizada\n\n' +
                  '4. RESPONSABILIDAD\n' +
                  'El usuario es responsable del uso adecuado.\n\n' +
                  '5. MODIFICACIONES\n' +
                  'Estos términos pueden cambiar sin previo aviso.'
                );
              }}
            >
              <Text style={styles.settingLabel}>Términos y Condiciones</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={() => {
                Alert.alert(
                  'Política de Privacidad',
                  '🔒 POLÍTICA DE PRIVACIDAD\n\n' +
                  '1. DATOS RECOPILADOS\n' +
                  '• Datos de sensores IoT\n' +
                  '• Configuraciones de usuario\n' +
                  '• Logs de aplicación\n\n' +
                  '2. USO DE DATOS\n' +
                  '• Monitoreo en tiempo real\n' +
                  '• Generación de alertas\n' +
                  '• Mejora del servicio\n\n' +
                  '3. ALMACENAMIENTO\n' +
                  '• Datos locales en el dispositivo\n' +
                  '• Sin transmisión a servidores externos\n\n' +
                  '4. SEGURIDAD\n' +
                  '• Encriptación de datos sensibles\n' +
                  '• Acceso restringido\n\n' +
                  '5. DERECHOS DEL USUARIO\n' +
                  '• Acceso a sus datos\n' +
                  '• Eliminación de datos\n' +
                  '• Portabilidad de datos'
                );
              }}
            >
              <Text style={styles.settingLabel}>Política de Privacidad</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]} 
          onPress={async () => {
            console.log('🔘 Botón "Cerrar Sesión" presionado');
            try {
              console.log('🔄 Logout iniciado...');
              await logout();
              console.log('   Logout completado');
              router.replace('/login');
              console.log('   Navegación al login completada');
            } catch (error) {
              console.error('  Error en logout:', error);
            }
          }}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>SensorSP v2025.1.0</Text>
                      <Text style={styles.versionText}>© 2025 Yonsn76</Text>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Advanced Export Modal */}
      <AdvancedExportModal
        visible={showAdvancedExportModal}
        onClose={() => setShowAdvancedExportModal(false)}
      />
      </View>
    </ProtectedRoute>
  );
}
