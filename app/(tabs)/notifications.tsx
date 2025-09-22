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
import AddAlertModal from '../../components/AddAlertModal';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationRule, notificationService } from '../../services/notificationService';

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();

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
  
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading notifications...');
      
      // Load notification rules
      const rules = notificationService.getNotificationRules();
      setNotificationRules(rules);
      
      // Load notification history
      const history = await notificationService.getNotificationHistory();
      setNotificationHistory(history);
      
      console.log('✅ Notifications loaded successfully');
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const toggleNotificationRule = (ruleId: string, enabled: boolean) => {
    notificationService.updateNotificationRule(ruleId, { enabled });
    setNotificationRules(notificationService.getNotificationRules());
  };

  const deleteNotificationRule = (ruleId: string) => {
    Alert.alert(
      '🗑️ Eliminar Alerta',
      '¿Estás seguro de que quieres eliminar esta alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            notificationService.removeNotificationRule(ruleId);
            setNotificationRules(notificationService.getNotificationRules());
          },
        },
      ]
    );
  };

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

  const testNotification = async () => {
    try {
      await notificationService.scheduleNotification(
        'Prueba de Notificación',
        'Esta es una notificación de prueba del sistema IoT',
        { test: true }
      );
              Alert.alert('Notificación enviada', 'La notificación de prueba se ha enviado correctamente.');
    } catch (error) {
              Alert.alert('Error', 'No se pudo enviar la notificación de prueba.');
    }
  };

  const handleAddAlert = (newRule: NotificationRule) => {
    notificationService.addNotificationRule(newRule);
    setNotificationRules(notificationService.getNotificationRules());
            Alert.alert('Alerta Agregada', 'La nueva alerta se ha agregado correctamente.');
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    ruleItemLast: {
      borderBottomWidth: 0,
    },
    ruleInfo: {
      flex: 1,
      marginRight: 16,
    },
    ruleName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
    },
    ruleDescription: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    ruleStatus: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    ruleActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    deleteButton: {
      padding: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    actionButton: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      paddingVertical: 16,
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
    },
    emptyStateIcon: {
      fontSize: 48,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
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
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            Bienvenido, {user?.username || 'Cargando...'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </View>
    );
  }

  const enabledRules = notificationRules.filter(rule => rule.enabled);
  const disabledRules = notificationRules.filter(rule => !rule.enabled);

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <Text style={styles.headerSubtitle}>
          Bienvenido, {user?.username || 'Usuario'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
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
            <Text style={styles.statNumber}>{notificationHistory.length}</Text>
            <Text style={styles.statLabel}>Notificaciones</Text>
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
          <TouchableOpacity style={styles.actionButton} onPress={testNotification}>
            <Text style={styles.actionButtonText}>
              <Ionicons name="notifications-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
              {' '}Probar
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
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleDescription}>
                      {rule.type === 'temperature' && `${translateCondition(rule.condition)} ${rule.value}°C`}
                      {rule.type === 'humidity' && `${translateCondition(rule.condition)} ${rule.value}%`}
                      {rule.type === 'actuator' && `${translateCondition(rule.condition)} ${rule.value}`}
                      {rule.type === 'status' && `${translateCondition(rule.condition)} ${rule.value}`}
                    </Text>
                    <Text style={styles.ruleStatus}>
                      {rule.id.startsWith('custom_') ? (
                        <>
                          <Ionicons name="construct-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} />
                          {' '}Personalizada
                        </>
                      ) : (
                        <>
                          <Ionicons name="settings-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} />
                          {' '}Predefinida
                        </>
                      )}
                    </Text>
                  </View>
                  <View style={styles.ruleActions}>
                    <Switch
                      value={rule.enabled}
                      onValueChange={(enabled) => toggleNotificationRule(rule.id, enabled)}
                      trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
                      thumbColor={rule.enabled ? '#FFFFFF' : '#f4f3f4'}
                    />
                    {rule.id.startsWith('custom_') && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteNotificationRule(rule.id)}
                      >
                        <Text style={{ color: '#FF3B30', fontSize: 16 }}>🗑️</Text>
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
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleDescription}>
                      {rule.type === 'temperature' && `${translateCondition(rule.condition)} ${rule.value}°C`}
                      {rule.type === 'humidity' && `${translateCondition(rule.condition)} ${rule.value}%`}
                      {rule.type === 'actuator' && `${translateCondition(rule.condition)} ${rule.value}`}
                      {rule.type === 'status' && `${translateCondition(rule.condition)} ${rule.value}`}
                    </Text>
                    <Text style={styles.ruleStatus}>
                      {rule.id.startsWith('custom_') ? (
                        <>
                          <Ionicons name="construct-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} />
                          {' '}Personalizada
                        </>
                      ) : (
                        <>
                          <Ionicons name="settings-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} />
                          {' '}Predefinida
                        </>
                      )}
                    </Text>
                  </View>
                  <View style={styles.ruleActions}>
                    <Switch
                      value={rule.enabled}
                      onValueChange={(enabled) => toggleNotificationRule(rule.id, enabled)}
                      trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
                      thumbColor={rule.enabled ? '#FFFFFF' : '#f4f3f4'}
                    />
                    {rule.id.startsWith('custom_') && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteNotificationRule(rule.id)}
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
