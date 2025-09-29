import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import AdvancedExportModal from '../../components/AdvancedExportModal';
import ExportModal from '../../components/ExportModal';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { sensorApi } from '../../services/sensorApi';
import { notificationService } from '../../services/notificationService';
import { userPreferencesApi } from '../../services/userPreferencesApi';
import { WidgetPreview } from '../../components/WidgetPreview';

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  
  // Responsive design
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400;
  const isVerySmallScreen = screenWidth < 350;
  
  // Estados básicos
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvancedExportModal, setShowAdvancedExportModal] = useState(false);
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  
  // Estados para preferencias
  const [preferredLocation, setPreferredLocation] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Estados para mostrar preferencias cargadas
  const [userPreferencesLoaded, setUserPreferencesLoaded] = useState(false);
  const [userPreferencesInfo, setUserPreferencesInfo] = useState({
    customNotifications: 0,
    activeNotifications: 0,
    totalNotifications: 0,
    lastUpdated: null as string | null
  });
  

  // Cargar configuraciones guardadas
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Cargar configuraciones locales
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setPreferredLocation(parsedSettings.preferredLocation || '');
      }
      
      // Cargar preferencias del usuario desde la API
      if (user?.id && user?.token) {
        try {
          const userPreferences = await userPreferencesApi.getUserPreferences(user.id, user.token);
          if (userPreferences.success && userPreferences.data) {
            // Actualizar la ubicación preferida desde la API
            if (userPreferences.data.preferredLocation) {
              setPreferredLocation(userPreferences.data.preferredLocation);
            }
            
            // Guardar información de preferencias para mostrar
            setUserPreferencesInfo({
              customNotifications: userPreferences.data.customNotifications?.length || 0,
              activeNotifications: userPreferences.data.activeNotifications?.length || 0,
              totalNotifications: userPreferences.data.totalNotifications || 0,
              lastUpdated: userPreferences.data.lastUpdated
            });
            setUserPreferencesLoaded(true);
            
            console.log('User preferences loaded from API:', {
              preferredLocation: userPreferences.data.preferredLocation,
              customNotifications: userPreferences.data.customNotifications?.length || 0,
              activeNotifications: userPreferences.data.activeNotifications?.length || 0,
              totalNotifications: userPreferences.data.totalNotifications || 0
            });
          }
        } catch (apiError) {
          console.error('Error loading user preferences from API:', apiError);
          // Continuar con configuraciones locales si falla la API
        }
      }
      
      // Cargar ubicaciones disponibles
      await loadAvailableLocations();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadAvailableLocations = async () => {
    try {
      const allSensors = await sensorApi.getAllSensors();
      const uniqueLocations = [...new Set(allSensors.map(sensor => sensor.ubicacion).filter(Boolean))] as string[];
      setAvailableLocations(uniqueLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        preferredLocation: preferredLocation
      };
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const savePreferencesToDatabase = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      // Obtener SOLO los datos reales que existen en el sistema
      const notificationRules = notificationService.getNotificationRules();
      
      // Filtrar solo las notificaciones personalizadas (creadas por el usuario)
      const customNotifications = notificationRules.filter(rule => rule.id.startsWith('custom_'));
      
      // Filtrar solo las notificaciones que están activadas
      const activeNotifications = notificationRules.filter(rule => rule.enabled);

      // Guardar SOLO los datos reales, sin inventar nada
      const preferences = {
        userId: user.id,
        username: user.username,
        email: user.email,
        preferredLocation: preferredLocation || null, // Solo si existe, sino null
        customNotifications: customNotifications, // Solo las que realmente existen
        activeNotifications: activeNotifications, // Solo las que están activas
        totalNotifications: notificationRules.length, // Contador real
        lastUpdated: new Date().toISOString()
      };

      // Llamada real a la API usando el servicio
      const response = await userPreferencesApi.saveUserPreferences(preferences, user.token || '');

      if (response.success) {
        Alert.alert(
          'Preferencias Guardadas', 
          `Ubicación preferida: ${preferredLocation || 'Ninguna'}\n\nNotificaciones:\n• Personalizadas: ${customNotifications.length}\n• Activas: ${activeNotifications.length}\n• Total: ${notificationRules.length}\n\nGuardado en BD exitosamente!`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(response.message || 'Error en la respuesta del servidor');
      }

    } catch (error: any) {
      console.error('Error saving preferences to database:', error);
      Alert.alert('Error', `No se pudieron guardar las preferencias en la base de datos: ${error.message}`);
    }
  };


  const handleLogout = async () => {
    console.log(' handleLogout() llamada - Mostrando alerta de confirmación');
    
    try {
      console.log('Creando alerta de confirmación...');
      
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



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      padding: 16,
      paddingTop: 10,
      backgroundColor: 'transparent',
    },
    headerGlass: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerSubtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      letterSpacing: -0.2,
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
    locationSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      borderRadius: 12,
      padding: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    locationSelectorText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
    },
    locationSelectorPlaceholder: {
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    savePreferencesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      gap: 8,
    },
    savePreferencesButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '60%',
      minHeight: '40%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalScrollView: {
      flex: 1,
    },
    locationOption: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    selectedLocationOption: {
      backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
    },
    locationOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationOptionText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      marginLeft: 12,
      flex: 1,
    },
    widgetModalContainer: {
      flex: 1,
    },
    widgetModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 50,
      borderBottomWidth: 1,
    },
    widgetModalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    widgetModalCloseButton: {
      padding: 8,
    },
  });

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlass}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="settings-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
          </View>
        </View>
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





        {/* Preferencias de Usuario */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Preferencias
            </Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Ubicación Preferida</Text>
              <TouchableOpacity
                style={styles.locationSelector}
                onPress={() => setShowLocationModal(true)}
              >
                <Text style={[
                  styles.locationSelectorText,
                  !preferredLocation && styles.locationSelectorPlaceholder
                ]}>
                  {preferredLocation || 'Seleccionar ubicación...'}
                </Text>
                <Ionicons name="chevron-down-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.savePreferencesButton}
              onPress={savePreferencesToDatabase}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
              <Text style={styles.savePreferencesButtonText}>Guardar Preferencias en BD</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Widgets */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="grid-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Widgets
            </Text>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={() => setShowWidgetPreview(true)}
            >
              <Text style={styles.settingLabel}>Vista Previa de Widgets</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </BlurView>

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
                  'Aplicación de Monitoreo IoT\n\n' +
                  ' Versión: 2025.1.0\n' +
                  'Plataforma: React Native + Expo\n' +
                  'Última actualización: Enero 2025\n\n' +
                  'Desarrollado por: Yonsn76\n' +
                  'Contacto: yonsn76@example.com\n\n' +
                  'Funcionalidades:\n' +
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

      {/* Widget Preview Modal */}
      <Modal
        visible={showWidgetPreview}
        animationType="slide"
        onRequestClose={() => setShowWidgetPreview(false)}
      >
        <View style={[styles.widgetModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={[styles.widgetModalHeader, { borderBottomColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <Text style={[styles.widgetModalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Vista Previa de Widgets
            </Text>
            <TouchableOpacity 
              onPress={() => setShowWidgetPreview(false)}
              style={styles.widgetModalCloseButton}
            >
              <Ionicons name="close-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
          <WidgetPreview />
        </View>
      </Modal>

      {/* Modal para seleccionar ubicación */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowLocationModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ubicación Preferida</Text>
              <TouchableOpacity 
                onPress={() => setShowLocationModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <TouchableOpacity
                style={[
                  styles.locationOption,
                  !preferredLocation && styles.selectedLocationOption
                ]}
                onPress={() => {
                  setPreferredLocation('');
                  setShowLocationModal(false);
                }}
              >
                <View style={styles.locationOptionContent}>
                  <Ionicons 
                    name="globe-outline" 
                    size={20} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                  <Text style={styles.locationOptionText}>Sin preferencia</Text>
                  {!preferredLocation && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color="#007AFF" 
                    />
                  )}
                </View>
              </TouchableOpacity>

              {availableLocations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationOption,
                    preferredLocation === location && styles.selectedLocationOption
                  ]}
                  onPress={() => {
                    setPreferredLocation(location);
                    setShowLocationModal(false);
                  }}
                >
                  <View style={styles.locationOptionContent}>
                    <Ionicons 
                      name="location-outline" 
                      size={20} 
                      color={isDark ? '#FFFFFF' : '#000000'} 
                    />
                    <Text style={styles.locationOptionText}>{location}</Text>
                    {preferredLocation === location && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color="#007AFF" 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </ProtectedRoute>
  );
}
