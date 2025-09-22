import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { AndroidConfig } from '../constants/AndroidConfig';
import { SensorData } from './sensorApi';

// Verificar plataforma y entorno de forma más robusta
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const isDevelopmentBuild = !isExpoGo && isMobile;

// Importar expo-notifications de forma más robusta
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('ℹ️ expo-notifications no disponible en este entorno');
}

// Configurar el comportamiento de las notificaciones para que sean como WhatsApp/Facebook
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log('📱 Notificación recibida:', notification.request.content.title);
        
        // Configuración para notificaciones reales como WhatsApp
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true, // Mostrar badge en el ícono de la app
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        };
      },
    });
  } catch (error) {
    console.log('⚠️ No se pudo configurar el handler de notificaciones:', error);
  }
}

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  type: 'temperature' | 'humidity' | 'actuator' | 'status';
  condition: 'mayor_que' | 'menor_que' | 'igual_a' | 'cambia_a';
  value: number | string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  sound: 'default' | 'alert' | 'critical' | 'none';
  vibration: boolean;
  createdAt?: string;
  lastTriggered?: string;
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: string;
}

export interface NotificationStats {
  totalSent: number;
  totalReceived: number;
  lastNotification: string | null;
  activeRules: number;
  customRules: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private notificationRules: NotificationRule[] = [
    {
      id: 'temp_high',
      name: 'Temperatura Alta',
      enabled: false,
      type: 'temperature',
      condition: 'mayor_que',
      value: 40,
      message: '🌡️ Temperatura crítica: {value}°C. Activar ventilación.',
    },
    {
      id: 'temp_low',
      name: 'Temperatura Baja',
      enabled: false,
      type: 'temperature',
      condition: 'menor_que',
      value: 0,
      message: '🧊 Temperatura muy baja: {value}°C. Activar calefacción.',
    },
    {
      id: 'humidity_high',
      name: 'Humedad Alta',
      enabled: false,
      type: 'humidity',
      condition: 'mayor_que',
      value: 80,
      message: '💧 Humedad alta: {value}%. Verificar sistema.',
    },
    {
      id: 'actuator_ventilador',
      name: 'Ventilador Activado',
      enabled: false,
      type: 'actuator',
      condition: 'igual_a',
      value: 'ventilador',
      message: '🌀 Ventilador activado. Temperatura: {temp}°C',
    },
    {
      id: 'actuator_calefactor',
      name: 'Calefactor Activado',
      enabled: false,
      type: 'actuator',
      condition: 'igual_a',
      value: 'calefactor',
      message: '🔥 Calefactor activado. Temperatura: {temp}°C',
    },
    {
      id: 'status_caliente',
      name: 'Estado Caliente',
      enabled: false,
      type: 'status',
      condition: 'igual_a',
      value: 'caliente',
      message: '🌡️ Sistema en estado caliente. Revisar condiciones.',
    },
    {
      id: 'status_frio',
      name: 'Estado Frío',
      enabled: false,
      type: 'status',
      condition: 'igual_a',
      value: 'frio',
      message: '❄️ Sistema en estado frío. Revisar condiciones.',
    },
  ];

  private lastNotificationTime: { [key: string]: number } = {};
  private readonly NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutos

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    // Si estamos en web, no hay notificaciones disponibles
    if (isWeb) {
      console.log('ℹ️ Las notificaciones no están disponibles en web');
      return false;
    }

    // Si estamos en Expo Go, mostrar mensaje informativo y retornar false
    if (isExpoGo) {
      console.log('ℹ️ Las notificaciones push no están soportadas en Expo Go. Las notificaciones se simularán en consola.');
      return false;
    }

    // Solo continuar en development builds con expo-notifications disponible
    if (!isDevelopmentBuild || !Notifications) {
      console.log('ℹ️ Las notificaciones solo están disponibles en development builds');
      return false;
    }

    if (!Device.isDevice) {
      console.log('⚠️ Las notificaciones solo funcionan en dispositivos físicos');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación no otorgados');
        return false;
      }

      // Configurar canal de notificaciones para Android según la documentación
      if (Device.osName === 'Android') {
        try {
          await Notifications.setNotificationChannelAsync(AndroidConfig.notification.channelId, {
            name: AndroidConfig.notification.channelName,
            description: AndroidConfig.notification.channelDescription,
            importance: Notifications.AndroidImportance.HIGH,
            sound: AndroidConfig.notification.sound,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        } catch (error) {
          console.log('⚠️ No se pudo configurar el canal de notificaciones:', error);
        }
      }

      console.log('✅ Permisos de notificación otorgados');
      return true;
    } catch (error) {
      console.error('❌ Error al solicitar permisos de notificación:', error);
      return false;
    }
  }

  async scheduleNotification(title: string, body: string, data?: any): Promise<string> {
    // Si estamos en web, no hay notificaciones disponibles
    if (isWeb) {
      console.log(`📱 [Web] Notificación simulada: ${title} - ${body}`);
      return 'web-simulated';
    }

    // Si estamos en Expo Go, solo mostrar en consola
    if (isExpoGo) {
      console.log(`📱 [Expo Go] Notificación simulada: ${title} - ${body}`);
      return 'expo-go-simulated';
    }

    // Solo intentar notificaciones reales en development builds con expo-notifications disponible
    if (!isDevelopmentBuild || !Notifications) {
      console.log(`📱 [Simulated] Notificación simulada: ${title} - ${body}`);
      return 'simulated';
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Notificación inmediata
      });

      console.log(`📱 Notificación enviada: ${title}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Error al enviar notificación:', error);
      // En lugar de lanzar error, retornar un ID simulado
      console.log(`📱 [Error] Notificación simulada: ${title} - ${body}`);
      return 'error-simulated';
    }
  }

  checkSensorData(sensorData: SensorData): void {
    this.notificationRules.forEach(rule => {
      if (!rule.enabled) return;

      const shouldNotify = this.evaluateRule(rule, sensorData);
      if (shouldNotify) {
        this.sendNotificationForRule(rule, sensorData);
      }
    });
  }

  private evaluateRule(rule: NotificationRule, sensorData: SensorData): boolean {
    const now = Date.now();
    const lastNotification = this.lastNotificationTime[rule.id] || 0;

    // Verificar cooldown
    if (now - lastNotification < this.NOTIFICATION_COOLDOWN) {
      return false;
    }

    switch (rule.type) {
      case 'temperature':
        return this.evaluateTemperatureRule(rule, sensorData.temperatura);
      case 'humidity':
        return this.evaluateHumidityRule(rule, sensorData.humedad);
      case 'actuator':
        return this.evaluateActuatorRule(rule, sensorData.actuador);
      case 'status':
        return this.evaluateStatusRule(rule, sensorData.estado);
      default:
        return false;
    }
  }

  private evaluateTemperatureRule(rule: NotificationRule, temperature: number): boolean {
    switch (rule.condition) {
      case 'mayor_que':
        return temperature > (rule.value as number);
      case 'menor_que':
        return temperature < (rule.value as number);
      default:
        return false;
    }
  }

  private evaluateHumidityRule(rule: NotificationRule, humidity: number): boolean {
    switch (rule.condition) {
      case 'mayor_que':
        return humidity > (rule.value as number);
      case 'menor_que':
        return humidity < (rule.value as number);
      default:
        return false;
    }
  }

  private evaluateActuatorRule(rule: NotificationRule, actuator: string): boolean {
    return rule.condition === 'igual_a' && actuator === rule.value;
  }

  private evaluateStatusRule(rule: NotificationRule, status: string): boolean {
    return rule.condition === 'igual_a' && status === rule.value;
  }

  private async sendNotificationForRule(rule: NotificationRule, sensorData: SensorData): Promise<void> {
    const message = this.formatMessage(rule.message, sensorData);
    
    await this.scheduleNotification(
      `IoT Alert: ${rule.name}`,
      message,
      {
        ruleId: rule.id,
        sensorData,
        timestamp: new Date().toISOString(),
      }
    );

    // Actualizar tiempo de última notificación
    this.lastNotificationTime[rule.id] = Date.now();
  }

  private formatMessage(template: string, sensorData: SensorData): string {
    return template
      .replace('{value}', sensorData.temperatura.toString())
      .replace('{temp}', sensorData.temperatura.toString())
      .replace('{humidity}', sensorData.humedad.toString())
      .replace('{actuator}', sensorData.actuador)
      .replace('{status}', sensorData.estado);
  }

  getNotificationRules(): NotificationRule[] {
    return [...this.notificationRules];
  }

  updateNotificationRule(ruleId: string, updates: Partial<NotificationRule>): void {
    const ruleIndex = this.notificationRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.notificationRules[ruleIndex] = { ...this.notificationRules[ruleIndex], ...updates };
      console.log(`✅ Regla de notificación actualizada: ${ruleId}`);
    }
  }

  addNotificationRule(rule: NotificationRule): void {
    this.notificationRules.push(rule);
    console.log(`✅ Nueva regla de notificación agregada: ${rule.name}`);
  }

  removeNotificationRule(ruleId: string): void {
    this.notificationRules = this.notificationRules.filter(rule => rule.id !== ruleId);
    console.log(`🗑️ Regla de notificación eliminada: ${ruleId}`);
  }

  async getNotificationHistory(): Promise<any[]> {
    // Si estamos en Expo Go o web, retornar array vacío
    if (isExpoGo || isWeb || !isDevelopmentBuild || !Notifications) {
      console.log('ℹ️ Historial de notificaciones no disponible en este entorno');
      return [];
    }

    try {
      const notifications = await Notifications.getPresentedNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('❌ Error al obtener historial de notificaciones:', error);
      return [];
    }
  }

  async clearAllNotifications(): Promise<void> {
    // Si estamos en Expo Go o web, solo mostrar mensaje
    if (isExpoGo || isWeb || !isDevelopmentBuild || !Notifications) {
      console.log('ℹ️ Limpieza de notificaciones no disponible en este entorno');
      return;
    }

    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('🗑️ Todas las notificaciones eliminadas');
    } catch (error) {
      console.error('❌ Error al eliminar notificaciones:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
