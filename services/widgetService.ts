import AsyncStorage from '@react-native-async-storage/async-storage';
import { sensorApi } from './sensorApi';
import { userPreferencesApi } from './userPreferencesApi';
import { notificationService } from './notificationService';

export interface WidgetData {
  temperature: string;
  humidity: string;
  status: string;
  location: string;
  actuator: string;
  lastUpdate: string;
  alerts: number;
  isOnline: boolean;
  statusColor: string;
  statusIcon: string;
}

export class WidgetService {
  private static readonly CACHE_KEY = 'widget_cache';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static async getWidgetData(userId: string, token: string): Promise<WidgetData | null> {
    try {
      // Verificar cache primero
      const cachedData = await this.getCachedData();
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        console.log('Using cached widget data');
        return cachedData.data;
      }

      // Obtener sensor preferido
      const preferredSensorId = await userPreferencesApi.getPreferredSensor(userId, token);
      
      // Obtener datos del sensor preferido
      const allSensors = await sensorApi.getAllSensors();
      const preferredSensor = allSensors.find(s => s.sensorId === preferredSensorId);
      
      if (!preferredSensor) {
        const fallbackData: WidgetData = {
          temperature: 'N/A',
          humidity: 'N/A',
          status: 'Sin datos',
          location: preferredSensorId ? `Sensor ${preferredSensorId} no encontrado` : 'No hay sensor preferido',
          actuator: 'N/A',
          lastUpdate: 'Nunca',
          alerts: 0,
          isOnline: false,
          statusColor: '#888888',
          statusIcon: 'help-circle'
        };
        
        await this.cacheData(fallbackData);
        return fallbackData;
      }

      // Obtener alertas activas
      const activeAlerts = await this.getActiveAlertsCount();

      // Determinar estado y colores
      const { statusColor, statusIcon } = this.getStatusInfo(preferredSensor.estado);

      const widgetData: WidgetData = {
        temperature: `${preferredSensor.temperatura}°C`,
        humidity: `${preferredSensor.humedad}%`,
        status: preferredSensor.estado || 'Desconocido',
        location: preferredSensor.ubicacion || 'No disponible',
        actuator: preferredSensor.actuador || 'N/A',
        lastUpdate: this.getTimeAgo(preferredSensor.fecha),
        alerts: activeAlerts,
        isOnline: true,
        statusColor,
        statusIcon
      };

      // Cachear datos
      await this.cacheData(widgetData);
      
      console.log('Widget data updated:', widgetData);
      return widgetData;
    } catch (error) {
      console.error('Error getting widget data:', error);
      
      // Retornar datos de fallback en caso de error
        const fallbackData: WidgetData = {
          temperature: 'Error',
          humidity: 'Error',
          status: 'Sin conexión',
          location: 'No disponible',
          actuator: 'N/A',
          lastUpdate: 'Error',
          alerts: 0,
          isOnline: false,
          statusColor: '#FF6B6B',
          statusIcon: 'warning'
        };
      
      return fallbackData;
    }
  }

  private static getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} h`;
    return `${Math.floor(diffMins / 1440)} d`;
  }

  private static getStatusInfo(status: string): { statusColor: string; statusIcon: string } {
    switch (status?.toLowerCase()) {
      case 'caliente':
        return { statusColor: '#FF6B6B', statusIcon: 'flame' };
      case 'frio':
        return { statusColor: '#4ECDC4', statusIcon: 'snow' };
      case 'normal':
        return { statusColor: '#51CF66', statusIcon: 'checkmark-circle' };
      default:
        return { statusColor: '#888888', statusIcon: 'help-circle' };
    }
  }

  private static async getActiveAlertsCount(): Promise<number> {
    try {
      const notificationRules = notificationService.getNotificationRules();
      return notificationRules.filter(rule => rule.enabled).length;
    } catch (error) {
      console.error('Error getting active alerts count:', error);
      return 0;
    }
  }

  private static async getCachedData(): Promise<{ data: WidgetData; timestamp: number } | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  private static async cacheData(data: WidgetData): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  static async refreshWidgetData(userId: string, token: string): Promise<WidgetData | null> {
    await this.clearCache();
    return this.getWidgetData(userId, token);
  }
}
