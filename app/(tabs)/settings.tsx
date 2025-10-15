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
import { AdvancedExportModal, ExportModal } from '../../components/ui/modals';
import { ProtectedRoute } from '../../components/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { sensorApi } from '../../services/sensorApi';
import { notificationService } from '../../services/notificationService';
import { notificationApi } from '../../services/notificationApi';
import { userPreferencesApi } from '../../services/userPreferencesApi';
import { accountService } from '../../services/accountService';
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
  
  // Estados para gestión de cuenta
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Estados para preferencias
  const [preferredLocation, setPreferredLocation] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Estados para mostrar preferencias cargadas
  const [userPreferencesLoaded, setUserPreferencesLoaded] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [userPreferencesInfo, setUserPreferencesInfo] = useState({
    myNotificationIds: 0,
    totalNotifications: 0,
    updatedAt: null as string | null
  });
  

  // Cargar configuraciones guardadas
  useEffect(() => {
    loadSettings();
  }, []);

  // Cargar preferencias del usuario cuando cambie el usuario
  useEffect(() => {
    if (user?.id && user?.token) {
      loadUserPreferences();
    }
  }, [user?.id, user?.token]);

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
            if (userPreferences.data?.preferredSensorId) {
              // Buscar la ubicación del sensor preferido
              const allSensors = await sensorApi.getAllSensors();
              const preferredSensor = allSensors.find(sensor => sensor.sensorId === userPreferences.data?.preferredSensorId);
              if (preferredSensor?.ubicacion) {
                setPreferredLocation(preferredSensor.ubicacion);
              }
            }
            
            // Cargar notificaciones desde la base de datos
            if (user?.id && user?.token) {
              await notificationService.loadNotificationsFromDatabase(user.id, user.token);
            }
            
            // Guardar información de preferencias para mostrar
            setUserPreferencesInfo({
              myNotificationIds: userPreferences.data.myNotificationIds?.length || 0,
              totalNotifications: userPreferences.data.totalNotifications || 0,
              updatedAt: userPreferences.data.updatedAt
            });
            setUserPreferencesLoaded(true);
            
            console.log('User preferences loaded from API:', {
              preferredSensorId: userPreferences.data.preferredSensorId,
              myNotificationIds: userPreferences.data.myNotificationIds?.length || 0,
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

      // Obtener notificaciones del usuario directamente desde la API
      console.log('🔍 Obteniendo notificaciones del usuario para guardar en preferencias...');
      const notificationsResponse = await notificationApi.getUserNotifications(user.id, user.token || '');
      
      let myNotificationIds: string[] = [];
      let totalNotifications = 0;
      
      if (notificationsResponse.success && notificationsResponse.data) {
        // Obtener solo las notificaciones inactivas (status: 'inactive')
        const inactiveNotifications = notificationsResponse.data.filter(notification => 
          notification.status === 'inactive'
        );
        
        myNotificationIds = inactiveNotifications.map(notification => notification.id);
        totalNotifications = notificationsResponse.data.length;
        
        console.log('📊 Notificaciones encontradas:', {
          total: notificationsResponse.data.length,
          inactive: inactiveNotifications.length,
          myNotificationIds: myNotificationIds
        });
      } else {
        console.log('⚠️ No se pudieron obtener notificaciones, usando datos de preferencias existentes');
        myNotificationIds = userPreferences?.myNotificationIds || [];
        totalNotifications = userPreferences?.totalNotifications || 0;
      }

    // Obtener notificaciones usando el nuevo método
    const notificationsData = {
      myNotificationIds: myNotificationIds,
      totalNotifications: totalNotifications
    };

      // Obtener el sensorId de la ubicación preferida
      let preferredSensorId = null;
      if (preferredLocation) {
        const allSensors = await sensorApi.getAllSensors();
        const preferredSensor = allSensors.find(sensor => sensor.ubicacion === preferredLocation);
        if (preferredSensor) {
          preferredSensorId = preferredSensor.sensorId;
        }
      }

      // Convertir 'system' a 'auto' para el backend
      const backendTheme = themeMode === 'system' ? 'auto' : themeMode;

      // Guardar SOLO los datos reales, sin inventar nada
      const preferences = {
        userId: user.id,
        preferredSensorId: preferredSensorId || null, // Guardar el sensorId en lugar de la ubicación
        myNotificationIds: notificationsData.myNotificationIds || [], // IDs de mis notificaciones
        totalNotifications: notificationsData.totalNotifications, // Contador real
        theme: backendTheme as 'light' | 'dark' | 'auto' // Guardar la preferencia de tema
        // updatedAt se maneja automáticamente en el backend
      };

      // Llamada real a la API usando el servicio
      const response = await userPreferencesApi.saveUserPreferences(preferences, user.token || '');

      if (response.success) {
        Alert.alert(
          'Preferencias Guardadas', 
          `Ubicación preferida: ${preferredLocation || 'Ninguna'}\nTema: ${themeMode === 'system' ? 'Sistema' : themeMode === 'light' ? 'Claro' : 'Oscuro'}\n\nNotificaciones:\n• Mis notificaciones: ${notificationsData.myNotificationIds?.length || 0}\n• Total: ${notificationsData.totalNotifications}\n\nGuardado en BD exitosamente!`,
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

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
    
    // Guardar automáticamente el tema en la base de datos
    try {
      if (user?.id && user?.token) {
        const backendTheme = newTheme === 'system' ? 'auto' : newTheme;
        
        // Obtener preferencias actuales
        const currentPrefs = userPreferences || {
          userId: user.id,
          preferredSensorId: null,
          myNotificationIds: [],
          totalNotifications: 0,
          theme: 'auto'
        };
        
        // Actualizar solo el tema
        const updatedPrefs = {
          ...currentPrefs,
          theme: backendTheme
        };
        
        await userPreferencesApi.saveUserPreferences(updatedPrefs, user.token);
        console.log('🎨 Tema guardado en la base de datos:', backendTheme);
      }
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  // Función para refrescar las preferencias
  const refreshUserPreferences = async () => {
    await loadUserPreferences();
  };

  // Cargar preferencias del usuario
  const loadUserPreferences = async () => {
    try {
      if (!user?.id || !user?.token) return;

      const response = await userPreferencesApi.getUserPreferences(user.id, user.token);
      if (response.success && response.data) {
        setUserPreferences(response.data);
        
        // Actualizar información de preferencias con datos reales de BD
        setUserPreferencesInfo({
          myNotificationIds: response.data.myNotificationIds?.length || 0,
          totalNotifications: response.data.totalNotifications || 0,
          updatedAt: response.data.updatedAt || null
        });
        
        setUserPreferencesLoaded(true);
        
        // Aplicar tema guardado
        if (response.data.theme) {
          const frontendTheme = response.data.theme === 'auto' ? 'system' : response.data.theme;
          setThemeMode(frontendTheme);
        }
        
        // Aplicar ubicación preferida si existe
        if (response.data?.preferredSensorId) {
          const allSensors = await sensorApi.getAllSensors();
          const preferredSensor = allSensors.find(sensor => sensor.sensorId === response.data?.preferredSensorId);
          if (preferredSensor?.ubicacion) {
            setPreferredLocation(preferredSensor.ubicacion);
          }
        }
        
        console.log('📊 Preferencias cargadas desde BD:', {
          myNotificationIds: response.data?.myNotificationIds?.length || 0,
          totalNotifications: response.data?.totalNotifications || 0,
          theme: response.data?.theme,
          preferredSensorId: response.data?.preferredSensorId
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Función para cambiar contraseña
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    // Validar nueva contraseña
    const passwordValidation = accountService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    // Validar confirmación de contraseña
    const confirmationValidation = accountService.validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmationValidation.isValid) {
      Alert.alert('Error', confirmationValidation.message);
      return;
    }

    // Validar que la nueva contraseña sea diferente
    const changeValidation = accountService.validatePasswordChange(currentPassword, newPassword);
    if (!changeValidation.isValid) {
      Alert.alert('Error', changeValidation.message);
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await accountService.changePassword(
        { currentPassword, newPassword },
        user?.token || ''
      );

      if (response.success) {
        Alert.alert(
          'Contraseña Cambiada',
          'Tu contraseña ha sido actualizada exitosamente. Por seguridad, deberás iniciar sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: async () => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowChangePasswordModal(false);
                // Cerrar sesión después de cambiar la contraseña por seguridad
                await logout();
                router.replace('/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo cambiar la contraseña');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = async () => {
    console.log('🔴 handleDeleteAccount llamada');
    console.log('🔴 Usuario:', user?.id, 'Token:', user?.token ? 'Presente' : 'Ausente');
    
    if (!user?.id || !user?.token) {
      console.log('🔴 Error: Usuario no autenticado');
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    console.log('🔴 Mostrando modal de confirmación');
    setShowDeleteAccountModal(true);
  };

  // Función para confirmar eliminación (primera confirmación)
  const handleFirstConfirmDelete = () => {
    console.log('🔴 Primera confirmación, mostrando segunda confirmación');
    setShowDeleteAccountModal(false);
    setShowDeleteConfirmModal(true);
  };

  // Función para confirmar eliminación (segunda confirmación)
  const handleFinalConfirmDelete = () => {
    console.log('🔴 Segunda confirmación, ejecutando eliminación');
    setShowDeleteConfirmModal(false);
    performAccountDeletion();
  };

  const performAccountDeletion = async () => {
    console.log('🔴 performAccountDeletion iniciada');
    setIsDeletingAccount(true);

    try {
      console.log('🔴 Llamando a accountService.deleteAccount...');
      const response = await accountService.deleteAccount(user?.id || '', user?.token || '');
      console.log('🔴 Respuesta del servicio:', response);

      if (response.success) {
        console.log('🔴 Eliminación exitosa, cerrando sesión automáticamente');
        const deletedData = (response as any).deletedData;
        
        // Cerrar sesión inmediatamente después de eliminar la cuenta
        try {
          console.log('🔴 Cerrando sesión automáticamente...');
          await logout();
          console.log('🔴 Sesión cerrada exitosamente');
        } catch (error) {
          console.error('🔴 Error durante logout:', error);
        }
        
        // Mostrar mensaje de confirmación y navegar
        const message = `Tu cuenta ha sido eliminada exitosamente.\n\nDatos eliminados:\n• Usuario: ${deletedData?.user?.username || 'N/A'}\n• Preferencias: ${deletedData?.preferences || 0}\n• Notificaciones: ${deletedData?.notifications || 0}\n\nTodos tus datos han sido removidos permanentemente del sistema.`;
        
        Alert.alert(
          'Cuenta Eliminada',
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('🔴 Navegando al login');
                router.replace('/login');
              }
            }
          ]
        );
        
        // Respaldo: navegar automáticamente después de 3 segundos
        setTimeout(() => {
          console.log('🔴 Navegación automática de respaldo');
          router.replace('/login');
        }, 3000);
      } else {
        console.log('🔴 Error en la respuesta:', response.message);
        Alert.alert('Error', response.message || 'No se pudo eliminar la cuenta');
      }
    } catch (error: any) {
      console.error('🔴 Error deleting account:', error);
      Alert.alert('Error', 'No se pudo eliminar la cuenta. Verifica tu conexión e intenta nuevamente.');
    } finally {
      console.log('🔴 Finalizando performAccountDeletion');
      setIsDeletingAccount(false);
    }
  };



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      padding: 16,
      paddingTop: 50,
      backgroundColor: 'transparent',
    },
    headerGlass: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      // Sin sombras para que se vea igual al botón
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
    preferencesInfoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    refreshButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(78, 205, 196, 0.1)',
    },
    loadingText: {
      fontSize: 14,
      color: isDark ? '#CCCCCC' : '#666666',
      textAlign: 'center',
      marginTop: 8,
    },
    preferencesInfoContainer: {
      marginTop: 12,
    },
    preferencesInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingVertical: 4,
    },
    preferencesInfoLabel: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 14,
      flex: 1,
      marginLeft: 8,
    },
    preferencesInfoValue: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 14,
      fontWeight: '600',
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      minWidth: 30,
      textAlign: 'center',
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
    modalContainer: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      minHeight: '50%',
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
    modalText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    // Estilos para modales de pantalla completa
    fullScreenModal: {
      flex: 1,
    },
    fullScreenHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      borderBottomWidth: 1,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    fullScreenTitle: {
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40,
    },
    fullScreenContent: {
      flex: 1,
      padding: 20,
    },
    // Estilos para información de la app
    infoSection: {
      marginBottom: 24,
    },
    infoSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    infoCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    featuresGrid: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 8,
    },
    featureText: {
      fontSize: 12,
      marginLeft: 8,
      flex: 1,
    },
    sensorsGrid: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    sensorItem: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 12,
    },
    sensorName: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 8,
    },
    sensorModel: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    statsGrid: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 12,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
    // Estilos para términos y condiciones
    legalSection: {
      marginBottom: 24,
    },
    legalCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    legalTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    legalText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    bulletList: {
      marginLeft: 16,
    },
    bulletItem: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    updateCard: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    updateText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    // Estilos para política de privacidad
    privacySection: {
      marginBottom: 24,
    },
    privacyCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    privacyTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    privacyText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    dataTypeSection: {
      marginBottom: 16,
    },
    dataTypeTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    securitySection: {
      marginTop: 8,
    },
    securityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    securityContent: {
      marginLeft: 12,
      flex: 1,
    },
    securityTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    securityText: {
      fontSize: 12,
      marginTop: 2,
    },
    rightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    rightItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 8,
    },
    rightText: {
      fontSize: 14,
      marginLeft: 8,
    },
    // Estilos para guía de uso
    guideSection: {
      marginBottom: 24,
    },
    guideCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    guideTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
    stepContainer: {
      marginTop: 8,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    stepNumberText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    stepDescription: {
      fontSize: 12,
      lineHeight: 16,
    },
    featureSection: {
      marginTop: 8,
    },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 8,
    },
    featureContent: {
      marginLeft: 12,
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 12,
      lineHeight: 16,
    },
    alertTypesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    alertTypeCard: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 12,
    },
    alertTypeTitle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 8,
      marginBottom: 4,
    },
    alertTypeDescription: {
      fontSize: 10,
      textAlign: 'center',
    },
    tipsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    tipItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 8,
    },
    tipText: {
      fontSize: 12,
      marginLeft: 8,
      flex: 1,
    },
    troubleshootingSection: {
      marginTop: 8,
    },
    problemCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      marginBottom: 8,
    },
    problemContent: {
      marginLeft: 12,
      flex: 1,
    },
    problemTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    problemSolution: {
      fontSize: 12,
      lineHeight: 16,
    },
    supportCard: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 8,
    },
    supportContent: {
      marginLeft: 12,
      flex: 1,
    },
    supportTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    supportText: {
      fontSize: 12,
      lineHeight: 16,
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
    // Estilos para gestión de cuenta
    accountSection: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 20,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
    dangerButton: {
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    dangerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    warningButton: {
      backgroundColor: '#FF9500',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    warningButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      marginBottom: 16,
    },
    modalButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    modalButtonDisabled: {
      backgroundColor: '#8E8E93',
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonDanger: {
      backgroundColor: '#FF3B30',
    },
  });

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BlurView
          intensity={isDark ? 20 : 0}
          tint={isDark ? 'dark' : 'light'}
          style={styles.headerGlass}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="settings-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
          </View>
        </BlurView>
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

        {/* Preferencias Cargadas del Usuario */}
        {userPreferencesLoaded ? (
          <BlurView
            intensity={isDark ? 20 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <View style={styles.sectionContent}>
              <View style={styles.preferencesInfoHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                  {' '}Preferencias Cargadas
                </Text>
                <TouchableOpacity 
                  onPress={refreshUserPreferences}
                  style={styles.refreshButton}
                >
                  <Ionicons name="refresh" size={16} color="#4ECDC4" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.preferencesInfoContainer}>
                <View style={styles.preferencesInfoRow}>
                  <Ionicons name="notifications-outline" size={16} color="#4ECDC4" />
                  <Text style={styles.preferencesInfoLabel}>Mis Notificaciones:</Text>
                  <Text style={styles.preferencesInfoValue}>{userPreferencesInfo.myNotificationIds}</Text>
                </View>
                
                <View style={styles.preferencesInfoRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#51CF66" />
                  <Text style={styles.preferencesInfoLabel}>Total Notificaciones:</Text>
                  <Text style={styles.preferencesInfoValue}>{userPreferencesInfo.totalNotifications}</Text>
                </View>
                
                
                {userPreferencesInfo.updatedAt && (
                  <View style={styles.preferencesInfoRow}>
                    <Ionicons name="time-outline" size={16} color="#888888" />
                    <Text style={styles.preferencesInfoLabel}>Última Actualización:</Text>
                    <Text style={styles.preferencesInfoValue}>
                      {new Date(userPreferencesInfo.updatedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </BlurView>
        ) : (
          <BlurView
            intensity={isDark ? 20 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="hourglass-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                {' '}Cargando Preferencias...
              </Text>
              <Text style={styles.loadingText}>
                Obteniendo datos de la base de datos...
              </Text>
            </View>
          </BlurView>
        )}

        {/* Gestión de Cuenta */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.accountSection}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Gestionar Cuenta
            </Text>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={() => setShowChangePasswordModal(true)}
            >
              <Text style={styles.settingLabel}>Cambiar Contraseña</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => {
                console.log('🔴 Botón "Eliminar Cuenta" presionado');
                handleDeleteAccount();
              }}
              disabled={isDeletingAccount}
            >
              <Text style={styles.dangerButtonText}>
                {isDeletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
              </Text>
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
              onPress={() => setShowAppInfoModal(true)}
            >
              <Text style={styles.settingLabel}>Información de la App</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowTermsModal(true)}
            >
              <Text style={styles.settingLabel}>Términos y Condiciones</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowPrivacyModal(true)}
            >
              <Text style={styles.settingLabel}>Política de Privacidad</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Guía de Uso */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="book-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Guía de Uso
            </Text>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={() => setShowGuideModal(true)}
            >
              <Text style={styles.settingLabel}>Guía de Uso Completa</Text>
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

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={showChangePasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowChangePasswordModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
              <TouchableOpacity 
                onPress={() => setShowChangePasswordModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={[styles.settingLabel, { marginBottom: 8 }]}>Contraseña Actual</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <Text style={[styles.settingLabel, { marginBottom: 8 }]}>Nueva Contraseña</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <Text style={[styles.settingLabel, { marginBottom: 8 }]}>Confirmar Nueva Contraseña</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  isChangingPassword && styles.modalButtonDisabled
                ]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                <Text style={styles.modalButtonText}>
                  {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para confirmar eliminación de cuenta (primera confirmación) */}
      <Modal
        visible={showDeleteAccountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowDeleteAccountModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Eliminar Cuenta</Text>
              <TouchableOpacity 
                onPress={() => setShowDeleteAccountModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalScrollView}>
              <View style={{ padding: 20 }}>
                <Ionicons name="warning-outline" size={48} color="#FF3B30" style={{ alignSelf: 'center', marginBottom: 16 }} />
                <Text style={[styles.settingLabel, { textAlign: 'center', marginBottom: 16, fontSize: 18 }]}>
                  ¿Estás seguro de que quieres eliminar tu cuenta?
                </Text>
                <Text style={[styles.settingLabel, { textAlign: 'center', marginBottom: 24, color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Esta acción no se puede deshacer y se perderán todos tus datos, preferencias y configuraciones.
                </Text>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#FF3B30', marginBottom: 12 }]}
                  onPress={handleFirstConfirmDelete}
                >
                  <Text style={styles.modalButtonText}>Sí, Eliminar Cuenta</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#8E8E93' }]}
                  onPress={() => setShowDeleteAccountModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para confirmar eliminación de cuenta (segunda confirmación) */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowDeleteConfirmModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
              <TouchableOpacity 
                onPress={() => setShowDeleteConfirmModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalScrollView}>
              <View style={{ padding: 20 }}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" style={{ alignSelf: 'center', marginBottom: 16 }} />
                <Text style={[styles.settingLabel, { textAlign: 'center', marginBottom: 16, fontSize: 18 }]}>
                  ¡Última Confirmación!
                </Text>
                <Text style={[styles.settingLabel, { textAlign: 'center', marginBottom: 24, color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Esta acción es irreversible. Todos tus datos, preferencias y configuraciones serán eliminados permanentemente.
                </Text>
                <Text style={[styles.settingLabel, { textAlign: 'center', marginBottom: 24, color: '#FF3B30', fontWeight: '600' }]}>
                  ¿Estás completamente seguro?
                </Text>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#FF3B30', marginBottom: 12 }]}
                  onPress={handleFinalConfirmDelete}
                  disabled={isDeletingAccount}
                >
                  <Text style={styles.modalButtonText}>
                    {isDeletingAccount ? 'Eliminando...' : 'Sí, Eliminar Definitivamente'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#8E8E93' }]}
                  onPress={() => setShowDeleteConfirmModal(false)}
                  disabled={isDeletingAccount}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Información de la App */}
      <Modal
        visible={showAppInfoModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAppInfoModal(false)}
      >
        <View style={[styles.fullScreenModal, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={[styles.fullScreenHeader, { borderBottomColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <TouchableOpacity 
              onPress={() => setShowAppInfoModal(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              📱 Información de la App
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <ScrollView style={styles.fullScreenContent} showsVerticalScrollIndicator={false}>
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                🔧 Información Técnica
              </Text>
              <View style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Versión</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>2025.1.0</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Plataforma</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>React Native + Expo</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Base de datos</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>MongoDB</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Backend</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>Node.js + Express</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Última actualización</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>Enero 2025</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                👨‍💻 Desarrollador
              </Text>
              <View style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Desarrollado por</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>Yonsn76</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Contacto</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>yonsn76@example.com</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>GitHub</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>github.com/yonsn76</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                🚀 Funcionalidades Principales
              </Text>
              <View style={[styles.featuresGrid, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <View style={styles.featureItem}>
                  <Ionicons name="pulse-outline" size={20} color="#007AFF" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Monitoreo en tiempo real</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="notifications-outline" size={20} color="#FF9500" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Alertas inteligentes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="download-outline" size={20} color="#34C759" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Exportación de datos</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="diamond-outline" size={20} color="#AF52DE" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Interfaz Liquid Glass</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people-outline" size={20} color="#FF2D92" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Gestión de usuarios</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#30D158" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Notificaciones push</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="bar-chart-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Gráficos interactivos</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="contrast-outline" size={20} color="#8E8E93" />
                  <Text style={[styles.featureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Modo oscuro/claro</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                🔧 Sensores Soportados
              </Text>
              <View style={[styles.sensorsGrid, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <View style={styles.sensorItem}>
                  <Ionicons name="thermometer-outline" size={24} color="#FF3B30" />
                  <Text style={[styles.sensorName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Temperatura</Text>
                  <Text style={[styles.sensorModel, { color: isDark ? '#CCCCCC' : '#666666' }]}>DHT22, DS18B20</Text>
                </View>
                <View style={styles.sensorItem}>
                  <Ionicons name="water-outline" size={24} color="#007AFF" />
                  <Text style={[styles.sensorName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Humedad</Text>
                  <Text style={[styles.sensorModel, { color: isDark ? '#CCCCCC' : '#666666' }]}>DHT22</Text>
                </View>
                <View style={styles.sensorItem}>
                  <Ionicons name="settings-outline" size={24} color="#34C759" />
                  <Text style={[styles.sensorName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Actuadores</Text>
                  <Text style={[styles.sensorModel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Ventiladores, Calefactores</Text>
                </View>
                <View style={styles.sensorItem}>
                  <Ionicons name="analytics-outline" size={24} color="#FF9500" />
                  <Text style={[styles.sensorName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Estados</Text>
                  <Text style={[styles.sensorModel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Normal, Caliente, Frío</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                📊 Estadísticas del Sistema
              </Text>
              <View style={[styles.statsGrid, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>∞</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Sensores monitoreados</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>1-60s</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Frecuencia de muestreo</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>1 año</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Historial de datos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>50</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>Alertas simultáneas</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Términos y Condiciones */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={[styles.fullScreenModal, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={[styles.fullScreenHeader, { borderBottomColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <TouchableOpacity 
              onPress={() => setShowTermsModal(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              📋 Términos y Condiciones
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <ScrollView style={styles.fullScreenContent} showsVerticalScrollIndicator={false}>
            <View style={styles.legalSection}>
              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  1. Aceptación de Términos
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Al instalar y usar SensorSP, usted acepta automáticamente estos términos y condiciones. Si no está de acuerdo, no utilice la aplicación.
                </Text>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  2. Descripción del Servicio
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  SensorSP es una aplicación de monitoreo IoT que permite:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Conectar y monitorear sensores de temperatura, humedad y actuadores</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Configurar alertas personalizadas basadas en reglas</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Visualizar datos en tiempo real mediante gráficos</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Exportar datos históricos en múltiples formatos</Text>
                </View>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  3. Uso Permitido
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Uso personal y educativo</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Monitoreo de sistemas domésticos o comerciales</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Investigación y desarrollo de proyectos IoT</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Gestión de alertas y notificaciones</Text>
                </View>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  4. Prohibiciones
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Uso comercial sin autorización expresa</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Modificación, ingeniería inversa o descompilación</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Distribución, venta o sublicencia</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Uso para actividades ilegales o maliciosas</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Interferencia con el funcionamiento del servicio</Text>
                </View>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  5. Responsabilidades del Usuario
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Mantener la confidencialidad de sus credenciales</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Usar la aplicación de manera responsable</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Respetar los derechos de propiedad intelectual</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Reportar vulnerabilidades de seguridad</Text>
                </View>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  6. Limitación de Responsabilidad
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  SensorSP se proporciona "tal como está". No garantizamos:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Disponibilidad continua del servicio</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Precisión absoluta de los datos</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Ausencia de errores o interrupciones</Text>
                </View>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  7. Propiedad Intelectual
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Todos los derechos de propiedad intelectual pertenecen al desarrollador. Queda prohibida cualquier reproducción no autorizada.
                </Text>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  8. Modificaciones
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente tras su publicación.
                </Text>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  9. Terminación
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Podemos suspender o terminar su acceso si viola estos términos.
                </Text>
              </View>

              <View style={[styles.legalCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.legalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  10. Ley Aplicable
                </Text>
                <Text style={[styles.legalText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Estos términos se rigen por las leyes locales aplicables.
                </Text>
              </View>

              <View style={[styles.updateCard, { backgroundColor: isDark ? '#2C2C2E' : '#E8F4FD' }]}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={[styles.updateText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Última actualización: Enero 2025
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Política de Privacidad */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={[styles.fullScreenModal, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={[styles.fullScreenHeader, { borderBottomColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <TouchableOpacity 
              onPress={() => setShowPrivacyModal(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              🔒 Política de Privacidad
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <ScrollView style={styles.fullScreenContent} showsVerticalScrollIndicator={false}>
            <View style={styles.privacySection}>
              <View style={[styles.privacyCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.privacyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🛡️ Información General
                </Text>
                <Text style={[styles.privacyText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  Esta política describe cómo SensorSP recopila, usa y protege su información personal y los datos de sus sensores IoT.
                </Text>
              </View>

              <View style={[styles.privacyCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.privacyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  📊 Datos que Recopilamos
                </Text>
                <View style={styles.dataTypeSection}>
                  <Text style={[styles.dataTypeTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Datos de Sensores:</Text>
                  <View style={styles.bulletList}>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Lecturas de temperatura y humedad</Text>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Estados de actuadores (ventiladores, calefactores)</Text>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Timestamps y ubicaciones de sensores</Text>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Configuraciones de alertas personalizadas</Text>
                  </View>
                </View>
                <View style={styles.dataTypeSection}>
                  <Text style={[styles.dataTypeTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Datos de Usuario:</Text>
                  <View style={styles.bulletList}>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Información de cuenta (email, nombre de usuario)</Text>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Preferencias de la aplicación</Text>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Configuraciones de notificaciones</Text>
                    <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Logs de actividad (para debugging)</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.privacyCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.privacyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🔄 Cómo Usamos Sus Datos
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Proporcionar monitoreo en tiempo real</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Generar alertas basadas en sus reglas</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Mejorar la funcionalidad de la aplicación</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Proporcionar soporte técnico</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Generar estadísticas anónimas de uso</Text>
                </View>
              </View>

              <View style={[styles.privacyCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.privacyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🔐 Almacenamiento y Seguridad
                </Text>
                <View style={styles.securitySection}>
                  <View style={styles.securityItem}>
                    <Ionicons name="phone-portrait-outline" size={20} color="#007AFF" />
                    <View style={styles.securityContent}>
                      <Text style={[styles.securityTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Almacenamiento Local</Text>
                      <Text style={[styles.securityText, { color: isDark ? '#CCCCCC' : '#666666' }]}>Datos sensibles en su dispositivo</Text>
                    </View>
                  </View>
                  <View style={styles.securityItem}>
                    <Ionicons name="server-outline" size={20} color="#34C759" />
                    <View style={styles.securityContent}>
                      <Text style={[styles.securityTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Base de Datos</Text>
                      <Text style={[styles.securityText, { color: isDark ? '#CCCCCC' : '#666666' }]}>MongoDB con encriptación</Text>
                    </View>
                  </View>
                  <View style={styles.securityItem}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#FF9500" />
                    <View style={styles.securityContent}>
                      <Text style={[styles.securityTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Medidas de Seguridad</Text>
                      <Text style={[styles.securityText, { color: isDark ? '#CCCCCC' : '#666666' }]}>JWT, HTTPS, auditoría</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.privacyCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.privacyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🚫 Compartir Información
                </Text>
                <Text style={[styles.privacyText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  NO compartimos sus datos con terceros sin su consentimiento explícito.
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Empresas de publicidad</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Servicios de análisis externos</Text>
                  <Text style={[styles.bulletItem, { color: isDark ? '#CCCCCC' : '#666666' }]}>• Gobiernos (excepto requerimiento legal)</Text>
                </View>
              </View>

              <View style={[styles.privacyCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.privacyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  ⚖️ Sus Derechos
                </Text>
                <View style={styles.rightsGrid}>
                  <View style={styles.rightItem}>
                    <Ionicons name="eye-outline" size={20} color="#007AFF" />
                    <Text style={[styles.rightText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Acceso</Text>
                  </View>
                  <View style={styles.rightItem}>
                    <Ionicons name="create-outline" size={20} color="#34C759" />
                    <Text style={[styles.rightText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Rectificación</Text>
                  </View>
                  <View style={styles.rightItem}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.rightText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Eliminación</Text>
                  </View>
                  <View style={styles.rightItem}>
                    <Ionicons name="download-outline" size={20} color="#FF9500" />
                    <Text style={[styles.rightText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Portabilidad</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.updateCard, { backgroundColor: isDark ? '#2C2C2E' : '#E8F4FD' }]}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={[styles.updateText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Última actualización: Enero 2025
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Guía de Uso */}
      <Modal
        visible={showGuideModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowGuideModal(false)}
      >
        <View style={[styles.fullScreenModal, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={[styles.fullScreenHeader, { borderBottomColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <TouchableOpacity 
              onPress={() => setShowGuideModal(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              📖 Guía de Uso
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <ScrollView style={styles.fullScreenContent} showsVerticalScrollIndicator={false}>
            <View style={styles.guideSection}>
              <View style={[styles.guideCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.guideTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🚀 Inicio Rápido
                </Text>
                <View style={styles.stepContainer}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: '#007AFF' }]}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Configurar Sensores</Text>
                      <Text style={[styles.stepDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Ve a la pantalla principal y verifica que los sensores aparezcan en la lista</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: '#34C759' }]}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Crear Alertas</Text>
                      <Text style={[styles.stepDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Ve a "Notificaciones", presiona "Agregar Alerta" y configura la condición</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: '#FF9500' }]}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Monitorear Datos</Text>
                      <Text style={[styles.stepDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Ve gráficos en tiempo real y exporta datos históricos</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.guideCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.guideTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  📊 Funcionalidades Principales
                </Text>
                <View style={styles.featureSection}>
                  <View style={styles.featureCard}>
                    <Ionicons name="home-outline" size={24} color="#007AFF" />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Pantalla Principal</Text>
                      <Text style={[styles.featureDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Vista general de sensores, gráficos y estadísticas</Text>
                    </View>
                  </View>
                  <View style={styles.featureCard}>
                    <Ionicons name="notifications-outline" size={24} color="#FF9500" />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Notificaciones</Text>
                      <Text style={[styles.featureDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Crear reglas personalizadas y gestionar alertas</Text>
                    </View>
                  </View>
                  <View style={styles.featureCard}>
                    <Ionicons name="settings-outline" size={24} color="#34C759" />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Configuración</Text>
                      <Text style={[styles.featureDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Tema, exportación, cuenta y información</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.guideCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.guideTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🔧 Tipos de Alertas
                </Text>
                <View style={styles.alertTypesGrid}>
                  <View style={styles.alertTypeCard}>
                    <Ionicons name="thermometer-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.alertTypeTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Temperatura</Text>
                    <Text style={[styles.alertTypeDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Mayor que, menor que, igual a</Text>
                  </View>
                  <View style={styles.alertTypeCard}>
                    <Ionicons name="water-outline" size={20} color="#007AFF" />
                    <Text style={[styles.alertTypeTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Humedad</Text>
                    <Text style={[styles.alertTypeDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Mayor que, menor que, igual a</Text>
                  </View>
                  <View style={styles.alertTypeCard}>
                    <Ionicons name="settings-outline" size={20} color="#34C759" />
                    <Text style={[styles.alertTypeTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Actuadores</Text>
                    <Text style={[styles.alertTypeDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Igual a, cambia a</Text>
                  </View>
                  <View style={styles.alertTypeCard}>
                    <Ionicons name="analytics-outline" size={20} color="#FF9500" />
                    <Text style={[styles.alertTypeTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Estados</Text>
                    <Text style={[styles.alertTypeDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>Normal, Caliente, Frío, Húmedo, Seco</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.guideCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.guideTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  💡 Consejos Útiles
                </Text>
                <View style={styles.tipsGrid}>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
                    <Text style={[styles.tipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Configura alertas con valores realistas</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="location-outline" size={20} color="#007AFF" />
                    <Text style={[styles.tipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Usa ubicaciones específicas</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="time-outline" size={20} color="#FF9500" />
                    <Text style={[styles.tipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Revisa el historial regularmente</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="download-outline" size={20} color="#AF52DE" />
                    <Text style={[styles.tipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Exporta datos para análisis</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.guideCard, { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' }]}>
                <Text style={[styles.guideTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  ❓ Solución de Problemas
                </Text>
                <View style={styles.troubleshootingSection}>
                  <View style={styles.problemCard}>
                    <Ionicons name="warning-outline" size={20} color="#FF3B30" />
                    <View style={styles.problemContent}>
                      <Text style={[styles.problemTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Alertas no funcionan</Text>
                      <Text style={[styles.problemSolution, { color: isDark ? '#CCCCCC' : '#666666' }]}>Verifica que estén activas y revisa la conexión de sensores</Text>
                    </View>
                  </View>
                  <View style={styles.problemCard}>
                    <Ionicons name="refresh-outline" size={20} color="#FF9500" />
                    <View style={styles.problemContent}>
                      <Text style={[styles.problemTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Datos no se actualizan</Text>
                      <Text style={[styles.problemSolution, { color: isDark ? '#CCCCCC' : '#666666' }]}>Verifica la conexión a internet y reinicia la aplicación</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.supportCard, { backgroundColor: isDark ? '#2C2C2E' : '#E8F4FD' }]}>
                <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
                <View style={styles.supportContent}>
                  <Text style={[styles.supportTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>¿Necesitas Ayuda?</Text>
                  <Text style={[styles.supportText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                    Email: support@sensorsp.app{'\n'}
                    Desarrollador: yonsn76@example.com{'\n'}
                    GitHub: github.com/yonsn76/sensorsp
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      </View>
    </ProtectedRoute>
  );
}
