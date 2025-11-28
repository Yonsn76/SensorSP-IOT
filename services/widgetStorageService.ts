import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Widget Storage Service for Native Android Widgets
 * Manages persistent storage for widget cache data and configurations
 * 
 * **Feature: native-widgets**
 */

// Cache expiration time: 15 minutes (matches widget update interval)
const CACHE_EXPIRATION_MS = 15 * 60 * 1000;

// Storage key prefixes
const CACHE_KEY_PREFIX = 'widget_cache_';
const CONFIG_KEY_PREFIX = 'widget_config_';

/**
 * Cached data structure for widget display
 */
export interface WidgetCacheData {
  temperature: string;
  humidity: string;
  status: string;
  statusColor: string;
  statusIcon: string;
  location: string;
  lastUpdate: string;
  alerts: number;
  isOffline: boolean;
  cachedAt: number;
}

/**
 * Widget configuration structure
 */
export interface WidgetConfig {
  sensorId: string;
  sensorName: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Widget Storage Service
 * Provides methods for caching widget data and storing widget configurations
 */
export class WidgetStorageService {
  /**
   * Get cached data for a specific widget
   * Returns null if no cache exists or cache is expired
   * 
   * @param widgetId - The unique widget identifier
   * @returns Cached widget data or null
   */
  static async getCachedData(widgetId: number): Promise<WidgetCacheData | null> {
    try {
      const key = `${CACHE_KEY_PREFIX}${widgetId}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const data: WidgetCacheData = JSON.parse(cached);
      
      // Check if cache is expired
      if (this.isCacheExpired(data.cachedAt)) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(`[WidgetStorageService] Error getting cached data for widget ${widgetId}:`, error);
      return null;
    }
  }

  /**
   * Save cached data for a specific widget
   * Automatically sets the cachedAt timestamp
   * 
   * @param widgetId - The unique widget identifier
   * @param data - The widget cache data to store
   */
  static async setCachedData(widgetId: number, data: WidgetCacheData): Promise<void> {
    try {
      const key = `${CACHE_KEY_PREFIX}${widgetId}`;
      const dataWithTimestamp: WidgetCacheData = {
        ...data,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error(`[WidgetStorageService] Error setting cached data for widget ${widgetId}:`, error);
      throw error;
    }
  }

  /**
   * Get configuration for a specific widget
   * 
   * @param widgetId - The unique widget identifier
   * @returns Widget configuration or null
   */
  static async getWidgetConfig(widgetId: number): Promise<WidgetConfig | null> {
    try {
      const key = `${CONFIG_KEY_PREFIX}${widgetId}`;
      const config = await AsyncStorage.getItem(key);
      
      if (!config) {
        return null;
      }

      return JSON.parse(config);
    } catch (error) {
      console.error(`[WidgetStorageService] Error getting config for widget ${widgetId}:`, error);
      return null;
    }
  }

  /**
   * Save configuration for a specific widget
   * 
   * @param widgetId - The unique widget identifier
   * @param config - The widget configuration to store
   */
  static async setWidgetConfig(widgetId: number, config: WidgetConfig): Promise<void> {
    try {
      const key = `${CONFIG_KEY_PREFIX}${widgetId}`;
      await AsyncStorage.setItem(key, JSON.stringify(config));
    } catch (error) {
      console.error(`[WidgetStorageService] Error setting config for widget ${widgetId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data for a specific widget (cache and config)
   * Used when a widget is removed from the home screen
   * 
   * @param widgetId - The unique widget identifier
   */
  static async clearWidgetData(widgetId: number): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${widgetId}`;
      const configKey = `${CONFIG_KEY_PREFIX}${widgetId}`;
      await AsyncStorage.multiRemove([cacheKey, configKey]);
    } catch (error) {
      console.error(`[WidgetStorageService] Error clearing data for widget ${widgetId}:`, error);
      throw error;
    }
  }

  /**
   * Check if the cache has expired
   * 
   * @param cachedAt - Timestamp when data was cached
   * @returns true if cache is expired
   */
  private static isCacheExpired(cachedAt: number): boolean {
    return Date.now() - cachedAt > CACHE_EXPIRATION_MS;
  }

  /**
   * Get cached data even if expired (for offline fallback)
   * This is used when network is unavailable
   * 
   * @param widgetId - The unique widget identifier
   * @returns Cached widget data or null (ignores expiration)
   */
  static async getCachedDataForOffline(widgetId: number): Promise<WidgetCacheData | null> {
    try {
      const key = `${CACHE_KEY_PREFIX}${widgetId}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error(`[WidgetStorageService] Error getting offline cached data for widget ${widgetId}:`, error);
      return null;
    }
  }
}
