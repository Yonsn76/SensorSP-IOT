import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ProtectedRoute } from '../../components/auth';
import { AddAlertModal } from '../../components/ui/modals';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { Notification, notificationApi } from '../../services/notificationApi';
import { notificationService } from '../../services/notificationService';

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { contentPaddingBottom } = useTabBarHeight();

  // Función para traducir condiciones a español
  const translateCondition = (condition: string): string => {
    const translations: { [key: string]: string } = {
      'mayor_que': 'Mayor que',
      'menor_que': 'Menor que',
      'igual_a': 'Igual a',
      'cambia_a': 'Cambia a',
    };
    return translations[condition] || condition;
  };
  
  const [notificationRules, setNotificationRules] = useState<Notification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState('');

  // Animación de puntos para el loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('Loading notifications...');
      
      if (!user?.id || !user?.token) {
        console.error('Usuario no autenticado');
        return;
      }

      // Obtener notificaciones desde la API
      const response = await notificationApi.getUserNotifications(user.id, user.token);
      
      if (response.success && response.data) {
        setNotificationRules(response.data);
        console.log('   Notifications loaded successfully from API');
      } else {
        console.error('Error loading notifications:', response.message);
        Alert.alert('Error', 'No se pudieron cargar las notificaciones');
      }
      
    } catch (error) {
      console.error('  Error loading notifications:', error);
      Alert.alert('Error', 'Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Las funciones toggleNotification y deleteNotification ya están definidas arriba

  const clearAllNotifications = async () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await notificationService.clearAllNotifications();
            await loadNotifications();
          },
        },
      ]
    );
  };


  const toggleNotification = async (notification: Notification) => {
    try {
      if (!user?.id || !user?.token) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      let response;
      if (notification.status === 'active') {
        // Desactivar notificación
        response = await notificationApi.deactivateNotification(notification.id, user.id, user.token);
      } else {
        // Activar notificación
        response = await notificationApi.activateNotification(notification.id, user.id, user.token);
      }

      if (response.success) {
        // Recargar notificaciones
        await loadNotifications();
        Alert.alert('Éxito', `Notificación ${notification.status === 'active' ? 'desactivada' : 'activada'} correctamente`);
      } else {
        Alert.alert('Error', response.message || 'No se pudo cambiar el estado de la notificación');
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      Alert.alert('Error', 'Error al cambiar el estado de la notificación');
    }
  };

  const deleteNotification = async (notification: Notification) => {
    try {
      if (!user?.id || !user?.token) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      const response = await notificationApi.deleteNotification(notification.id, user.id, user.token);

      if (response.success) {
        // Recargar notificaciones
        await loadNotifications();
        Alert.alert('Éxito', 'Notificación eliminada correctamente');
      } else {
        Alert.alert('Error', response.message || 'No se pudo eliminar la notificación');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Error al eliminar la notificación');
    }
  };

  const handleAddAlert = async (newRule: any) => {
    try {
      // Validar que el usuario esté autenticado
      if (!user?.id || !user?.token) {
        console.error('❌ Usuario no autenticado:', { userId: user?.id, hasToken: !!user?.token });
        Alert.alert('Error', 'Usuario no autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Validar que el token no esté vacío
      if (!user.token || user.token.trim() === '') {
        console.error('❌ Token vacío o inválido');
        Alert.alert('Error', 'Token de autenticación inválido. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Validar datos de la notificación
      if (!newRule.name || !newRule.type || !newRule.condition) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos.');
        return;
      }

      // Validar valor según el tipo
      if (newRule.type === 'temperature') {
        const tempValue = Number(newRule.value);
        if (isNaN(tempValue) || tempValue < -50 || tempValue > 100) {
          Alert.alert('Error', 'La temperatura debe estar entre -50°C y 100°C.');
          return;
        }
      } else if (newRule.type === 'humidity') {
        const humidityValue = Number(newRule.value);
        if (isNaN(humidityValue) || humidityValue < 0 || humidityValue > 100) {
          Alert.alert('Error', 'La humedad debe estar entre 0% y 100%.');
          return;
        }
      }

      console.log('🔐 Usuario autenticado:', {
        userId: user.id,
        tokenLength: user.token?.length || 0,
        tokenPreview: user.token ? `${user.token.substring(0, 20)}...` : 'NO TOKEN'
      });

      console.log('📝 Datos a enviar:', {
        userId: user.id,
        name: newRule.name,
        type: newRule.type,
        condition: newRule.condition,
        value: newRule.value,
        message: newRule.message,
        location: newRule.location || 'Todas las ubicaciones'
      });

      // Crear notificación en la API
      const response = await notificationApi.createNotification({
        userId: user.id,
        name: newRule.name,
        type: newRule.type,
        condition: newRule.condition,
        value: newRule.value,
        message: newRule.message,
        location: newRule.location || 'Todas las ubicaciones'
      }, user.token);

      console.log('📡 Respuesta de la API:', response);

      if (response.success) {
        // Recargar notificaciones desde la API
        await loadNotifications();
        Alert.alert('Alerta Agregada', 'La nueva alerta se ha agregado correctamente a la base de datos.');
      } else {
        const errorMessage = response.message || response.error || 'No se pudo agregar la alerta';
        console.error('❌ Error en la respuesta:', errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error adding alert:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      Alert.alert('Error', error?.response?.data?.message || error?.message || 'Error al agregar la alerta');
    }
  };

  useEffect(() => {
    loadNotifications();
    // Cargar notificaciones en el servicio de notificaciones
    if (user?.id && user?.token) {
      notificationService.loadNotificationsFromDatabase(user.id, user.token);
    }
  }, [user]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
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
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      letterSpacing: -0.2,
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
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
    },
    sectionContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 16,
    },
    ruleItem: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
      borderRadius: 16,
      marginBottom: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    ruleItemLast: {
      marginBottom: 0,
    },
    ruleInfo: {
      flex: 1,
    },
    ruleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    ruleName: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      letterSpacing: -0.3,
      flex: 1,
      marginRight: 12,
    },
    ruleDescription: {
      fontSize: 15,
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(29, 29, 31, 0.7)',
      marginBottom: 8,
      lineHeight: 20,
      fontWeight: '500',
    },
    ruleLocation: {
      fontSize: 13,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      fontWeight: '500',
    },
    ruleStatus: {
      fontSize: 12,
      color: isDark ? '#8E8E93' : '#6D6D70',
      flexDirection: 'row',
      alignItems: 'center',
      fontWeight: '600',
      paddingHorizontal: 6,
      paddingVertical: 3,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    ruleLastTriggered: {
      fontSize: 12,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
      fontWeight: '500',
    },
    ruleMessage: {
      fontSize: 12,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(29, 29, 31, 0.6)',
      marginBottom: 6,
      fontStyle: 'italic',
      flexDirection: 'row',
      alignItems: 'center',
      lineHeight: 16,
    },
    ruleActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 8,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.1)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.3)',
    },
    actionButtons: {
      marginBottom: 20,
    },
    actionButton: {
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    actionButtonText: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 16,
      fontWeight: '600',
    },
    historyItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    historyItemLast: {
      borderBottomWidth: 0,
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
    },
    historyMessage: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    historyTime: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      marginTop: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyStateIcon: {
      fontSize: 48,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(29, 29, 31, 0.6)',
      textAlign: 'center',
      fontWeight: '500',
      lineHeight: 22,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Bienvenido, {user?.username || 'Cargando...'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Obteniendo registro{loadingDots}</Text>
        </View>
      </View>
    );
  }

  const enabledRules = notificationRules.filter(rule => rule.status === 'active');
  const disabledRules = notificationRules.filter(rule => rule.status === 'inactive');

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
              <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <Text style={styles.headerTitle}>Avisos del sistema</Text>
          </View>
        </BlurView>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{enabledRules.length}</Text>
            <Text style={styles.statLabel}>Alertas Activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{notificationRules.length}</Text>
            <Text style={styles.statLabel}>Total Alertas</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.actionButtonText}>
              <Ionicons name="add-circle-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Agregar Alerta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Notification Rules */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="notifications-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Alertas Activas ({enabledRules.length})
            </Text>
            
            {enabledRules.length > 0 ? (
              enabledRules.map((rule, index) => (
                <View 
                  key={rule.id} 
                  style={[
                    styles.ruleItem,
                    index === enabledRules.length - 1 && styles.ruleItemLast
                  ]}
                >
                  <View style={styles.ruleInfo}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      <Text style={styles.ruleStatus}>
                        {rule.status === 'active' ? (
                          <>
                            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                            {' '}Activa
                          </>
                        ) : (
                          <>
                            <Ionicons name="pause-circle" size={12} color="#FF9800" />
                            {' '}Inactiva
                          </>
                        )}
                      </Text>
                    </View>
                    
                    <Text style={styles.ruleDescription}>
                      {rule.type === 'temperature' && `${translateCondition(rule.condition)} ${rule.value}°C`}
                      {rule.type === 'humidity' && `${translateCondition(rule.condition)} ${rule.value}%`}
                      {rule.type === 'actuator' && `${translateCondition(rule.condition)} ${rule.value}`}
                      {rule.type === 'status' && `${translateCondition(rule.condition)} ${rule.value}`}
                    </Text>
                    
                    <Text style={styles.ruleLocation}>
                      <Ionicons name="location-outline" size={12} color={isDark ? '#8E8E93' : '#6D6D70'} />
                      {' '}{rule.location || 'Todas las ubicaciones'}
                    </Text>
                    
                    {rule.lastTriggered && (
                      <Text style={styles.ruleLastTriggered}>
                        <Ionicons name="time-outline" size={12} color={isDark ? '#8E8E93' : '#6D6D70'} />
                        {' '}Última activación: {new Date(rule.lastTriggered).toLocaleString()}
                      </Text>
                    )}
                    
                    {rule.message && (
                      <Text style={styles.ruleMessage}>
                        <Ionicons name="chatbubble-outline" size={12} color={isDark ? '#8E8E93' : '#6D6D70'} />
                        {' '}{rule.message}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.ruleActions}>
                    <Switch
                      value={rule.status === 'active'}
                      onValueChange={() => toggleNotification(rule)}
                      trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
                      thumbColor={rule.status === 'active' ? '#FFFFFF' : '#f4f3f4'}
                    />
                    {rule.status === 'inactive' && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteNotification(rule)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.emptyStateText}>No hay alertas activas</Text>
              </View>
            )}
          </View>
        </BlurView>

        {/* Disabled Notification Rules */}
        {disabledRules.length > 0 && (
          <BlurView
            intensity={isDark ? 20 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="pause-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                {' '}Alertas Desactivadas ({disabledRules.length})
              </Text>
              
              {disabledRules.map((rule, index) => (
                <View 
                  key={rule.id} 
                  style={[
                    styles.ruleItem,
                    index === disabledRules.length - 1 && styles.ruleItemLast
                  ]}
                >
                  <View style={styles.ruleInfo}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      <Text style={styles.ruleStatus}>
                        {rule.status === 'active' ? (
                          <>
                            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                            {' '}Activa
                          </>
                        ) : (
                          <>
                            <Ionicons name="pause-circle" size={12} color="#FF9800" />
                            {' '}Inactiva
                          </>
                        )}
                      </Text>
                    </View>
                    
                    <Text style={styles.ruleDescription}>
                      {rule.type === 'temperature' && `${translateCondition(rule.condition)} ${rule.value}°C`}
                      {rule.type === 'humidity' && `${translateCondition(rule.condition)} ${rule.value}%`}
                      {rule.type === 'actuator' && `${translateCondition(rule.condition)} ${rule.value}`}
                      {rule.type === 'status' && `${translateCondition(rule.condition)} ${rule.value}`}
                    </Text>
                    
                    <Text style={styles.ruleLocation}>
                      <Ionicons name="location-outline" size={12} color={isDark ? '#8E8E93' : '#6D6D70'} />
                      {' '}{rule.location || 'Todas las ubicaciones'}
                    </Text>
                    
                    {rule.lastTriggered && (
                      <Text style={styles.ruleLastTriggered}>
                        <Ionicons name="time-outline" size={12} color={isDark ? '#8E8E93' : '#6D6D70'} />
                        {' '}Última activación: {new Date(rule.lastTriggered).toLocaleString()}
                      </Text>
                    )}
                    
                    {rule.message && (
                      <Text style={styles.ruleMessage}>
                        <Ionicons name="chatbubble-outline" size={12} color={isDark ? '#8E8E93' : '#6D6D70'} />
                        {' '}{rule.message}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.ruleActions}>
                    <Switch
                      value={rule.status === 'active'}
                      onValueChange={() => toggleNotification(rule)}
                      trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
                      thumbColor={rule.status === 'active' ? '#FFFFFF' : '#f4f3f4'}
                    />
                    {rule.status === 'inactive' && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteNotification(rule)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </BlurView>
        )}

        {/* Notification History */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.section}
        >
          <View style={styles.sectionContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="phone-portrait-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                {' '}Historial de Notificaciones
              </Text>
              <TouchableOpacity onPress={clearAllNotifications}>
                <Text style={{ color: '#FF3B30', fontSize: 14 }}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            
            {notificationHistory.length > 0 ? (
              notificationHistory.map((notification, index) => (
                <View 
                  key={notification.identifier} 
                  style={[
                    styles.historyItem,
                    index === notificationHistory.length - 1 && styles.historyItemLast
                  ]}
                >
                  <Text style={styles.historyTitle}>{notification.request.content.title}</Text>
                  <Text style={styles.historyMessage}>{notification.request.content.body}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(notification.date).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait-outline" size={48} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.emptyStateText}>No hay notificaciones recientes</Text>
              </View>
            )}
          </View>
        </BlurView>
      </ScrollView>

      {/* Add Alert Modal */}
      <AddAlertModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddAlert={handleAddAlert}
      />
      </View>
    </ProtectedRoute>
  );
}
