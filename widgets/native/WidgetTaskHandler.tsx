import React from 'react';
import { Linking } from 'react-native';
import { WidgetTaskHandlerProps, requestWidgetUpdate } from 'react-native-android-widget';
import { SensorData, sensorApi } from '../../services/sensorApi';
import { WidgetCacheData, WidgetStorageService } from '../../services/widgetStorageService';
import {
    BATTERY_SAVER_UPDATE_INTERVAL_MS,
    MAX_UPDATE_EXECUTION_TIME_MS,
    NORMAL_UPDATE_INTERVAL_MS,
    fetchWithTimeout,
    getUpdateIntervalSync,
    hasTimeRemaining,
    isPowerSaveMode,
} from './batteryOptimization';
import { LargeWidgetNative } from './LargeWidgetNative';
import { MediumWidgetNative } from './MediumWidgetNative';
import { SmallWidgetNative } from './SmallWidgetNative';
import { SensorStatus, getStatusColor, getStatusIcon } from './widgetUtils';

/**
 * Widget Task Handler for SensorSP Native Android Widgets
 * Handles background updates and user interactions with widgets
 * 
 * **Feature: native-widgets**
 * **Validates: Requirements 1.3, 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3**
 */

const WIDGET_TASK_NAME = 'SENSORSP_WIDGET_TASK';

// Widget name constants for identification
const WIDGET_NAMES = {
  SMALL: 'SensorSPSmallWidget',
  MEDIUM: 'SensorSPMediumWidget',
  LARGE: 'SensorSPLargeWidget',
} as const;

// Deep link URL scheme for the app
const APP_SCHEME = 'sensorsp://';

// Custom click action types for our widgets
export type WidgetClickAction = 'REFRESH' | 'OPEN_APP' | 'OPEN_ALERTS';

/**
 * Main widget task handler function
 * This function is called by the Android system when widget events occur
 * 
 * **Validates: Requirements 1.3, 3.1, 3.2**
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const { widgetAction, widgetInfo } = props;
  const { widgetId, widgetName } = widgetInfo;

  console.log(`[WidgetTaskHandler] Action: ${widgetAction}, Widget: ${widgetName}, ID: ${widgetId}`);


  try {
    switch (widgetAction) {
      case 'WIDGET_ADDED':
        await handleWidgetAdded(widgetId, widgetName);
        break;
      case 'WIDGET_UPDATE':
        await handleWidgetUpdate(widgetId, widgetName);
        break;
      case 'WIDGET_RESIZED':
        await handleWidgetResized(widgetId, widgetName);
        break;
      case 'WIDGET_DELETED':
        await handleWidgetDeleted(widgetId, widgetName);
        break;
      case 'WIDGET_CLICK':
        if ('clickAction' in props) {
          await handleWidgetClick(widgetId, widgetName, props.clickAction as WidgetClickAction);
        }
        break;
      default:
        console.log(`[WidgetTaskHandler] Unknown action: ${widgetAction}`);
    }
  } catch (error) {
    console.error(`[WidgetTaskHandler] Error handling action ${widgetAction}:`, error);
  }
}

/**
 * Handle widget added to home screen
 * Performs initial data fetch and widget rendering
 */
async function handleWidgetAdded(widgetId: number, widgetName: string): Promise<void> {
  console.log(`[WidgetTaskHandler] Widget added: ${widgetName} (ID: ${widgetId})`);
  await fetchAndUpdateWidget(widgetId, widgetName);
}

/**
 * Handle periodic widget updates (called every 15 minutes by Android)
 * Fetches fresh data from API and updates widget display
 * 
 * **Validates: Requirements 3.1**
 */
async function handleWidgetUpdate(widgetId: number, widgetName: string): Promise<void> {
  console.log(`[WidgetTaskHandler] Updating widget: ${widgetName} (ID: ${widgetId})`);
  await fetchAndUpdateWidget(widgetId, widgetName);
}

/**
 * Handle widget resized on home screen
 * Re-renders widget with appropriate layout for new size
 */
async function handleWidgetResized(widgetId: number, widgetName: string): Promise<void> {
  console.log(`[WidgetTaskHandler] Widget resized: ${widgetName} (ID: ${widgetId})`);
  await fetchAndUpdateWidget(widgetId, widgetName);
}

/**
 * Handle widget deleted from home screen
 * Cleans up cached data and configuration
 */
async function handleWidgetDeleted(widgetId: number, widgetName: string): Promise<void> {
  console.log(`[WidgetTaskHandler] Widget deleted: ${widgetName} (ID: ${widgetId})`);
  try {
    await WidgetStorageService.clearWidgetData(widgetId);
    console.log(`[WidgetTaskHandler] Cleared data for widget ${widgetId}`);
  } catch (error) {
    console.error(`[WidgetTaskHandler] Error clearing widget data:`, error);
  }
}

/**
 * Handle widget tap/click events
 * Click actions can include: 'REFRESH', 'OPEN_APP', 'OPEN_ALERTS'
 * 
 * **Validates: Requirements 1.3, 3.2, 5.3**
 */
async function handleWidgetClick(
  widgetId: number, 
  widgetName: string, 
  clickAction?: WidgetClickAction
): Promise<void> {
  console.log(`[WidgetTaskHandler] Widget clicked: ${widgetName} (ID: ${widgetId}), action: ${clickAction}`);
  
  switch (clickAction) {
    case 'REFRESH':
      console.log(`[WidgetTaskHandler] Manual refresh for widget ${widgetId}`);
      await fetchAndUpdateWidget(widgetId, widgetName);
      break;
    case 'OPEN_APP':
      console.log(`[WidgetTaskHandler] Opening app from widget ${widgetId}`);
      await openAppSection(''); // Opens to index/dashboard
      break;
    case 'OPEN_ALERTS':
      console.log(`[WidgetTaskHandler] Opening alerts from widget ${widgetId}`);
      await openAppSection('notifications'); // Opens to notifications tab
      break;
    default:
      console.log(`[WidgetTaskHandler] Default click action for widget ${widgetId}`);
      await openAppSection(''); // Opens to index/dashboard
  }
}


/**
 * Fetch sensor data from API and update widget display
 * Falls back to cached data if network request fails
 * Implements timeout to ensure updates complete within 10 seconds (Requirements 8.3)
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 8.3**
 */
async function fetchAndUpdateWidget(widgetId: number, widgetName: string): Promise<void> {
  const startTime = Date.now();
  let widgetData: WidgetCacheData;
  let isOffline = false;

  try {
    // Use timeout wrapper to ensure data fetch completes within time limit
    // This validates Requirements 8.3: complete within 10 seconds
    const sensorData = await fetchWithTimeout(async () => {
      return await fetchSensorData(widgetId);
    });
    
    if (sensorData) {
      widgetData = transformSensorDataToCache(sensorData);
      
      // Check if we still have time to cache the data
      if (hasTimeRemaining(startTime, 1000)) {
        await WidgetStorageService.setCachedData(widgetId, widgetData);
        console.log(`[WidgetTaskHandler] Cached fresh data for widget ${widgetId}`);
      }
    } else {
      throw new Error('No sensor data available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[WidgetTaskHandler] Failed to fetch fresh data (${errorMessage}), using cache`);
    
    const cachedData = await WidgetStorageService.getCachedDataForOffline(widgetId);
    
    if (cachedData) {
      widgetData = { ...cachedData, isOffline: true };
      isOffline = true;
      console.log(`[WidgetTaskHandler] Using cached data for widget ${widgetId}`);
    } else {
      widgetData = getDefaultWidgetData();
      isOffline = true;
      console.log(`[WidgetTaskHandler] No cached data, using defaults for widget ${widgetId}`);
    }
  }

  // Check if we still have time to render
  if (hasTimeRemaining(startTime, 2000)) {
    await renderWidget(widgetId, widgetName, widgetData, isOffline);
  } else {
    console.warn(`[WidgetTaskHandler] Running low on time, skipping render for widget ${widgetId}`);
  }

  const elapsed = Date.now() - startTime;
  console.log(`[WidgetTaskHandler] Widget update completed in ${elapsed}ms (limit: ${MAX_UPDATE_EXECUTION_TIME_MS}ms)`);
}

/**
 * Fetch sensor data from API
 * Uses widget configuration to determine which sensor to fetch
 * Falls back to user preferences for default sensor if no widget config exists
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */
async function fetchSensorData(widgetId: number): Promise<SensorData | null> {
  try {
    // First, try to get sensor from widget configuration
    const config = await WidgetStorageService.getWidgetConfig(widgetId);
    
    if (config && config.sensorId) {
      console.log(`[WidgetTaskHandler] Using configured sensor: ${config.sensorId}`);
      const sensors = await sensorApi.getSensorsBySensorId(config.sensorId);
      if (sensors.length > 0) {
        return sensors.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )[0];
      }
    }
    
    // If no widget config, try to get user's preferred sensor from user preferences
    if (config && config.userId) {
      try {
        // Note: In headless JS context, we may not have auth token
        // This is a best-effort attempt to use user preferences
        console.log(`[WidgetTaskHandler] Checking user preferences for default sensor`);
        const prefsResponse = await userPreferencesApi.getUserPreferences(config.userId, '');
        if (prefsResponse.success && prefsResponse.data?.preferredSensorId) {
          const preferredSensorId = prefsResponse.data.preferredSensorId;
          console.log(`[WidgetTaskHandler] Using preferred sensor from user preferences: ${preferredSensorId}`);
          const sensors = await sensorApi.getSensorsBySensorId(preferredSensorId);
          if (sensors.length > 0) {
            return sensors.sort((a, b) => 
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            )[0];
          }
        }
      } catch (prefsError) {
        console.log(`[WidgetTaskHandler] Could not fetch user preferences, using latest sensor`);
      }
    }
    
    // Fallback to latest sensor from any source
    console.log(`[WidgetTaskHandler] Using latest sensor as fallback`);
    return await sensorApi.getLatestSensor();
  } catch (error) {
    console.error(`[WidgetTaskHandler] Error fetching sensor data:`, error);
    return null;
  }
}

/**
 * Transform API sensor data to widget cache format
 */
function transformSensorDataToCache(sensorData: SensorData): WidgetCacheData {
  const status = sensorData.estado as SensorStatus;
  
  return {
    temperature: `${sensorData.temperatura}°C`,
    humidity: `${sensorData.humedad}%`,
    status: status,
    statusColor: getStatusColor(status),
    statusIcon: getStatusIcon(status),
    location: sensorData.ubicacion || 'Sin ubicación',
    lastUpdate: sensorData.fecha,
    alerts: 0,
    isOffline: false,
    cachedAt: Date.now(),
  };
}

/**
 * Get default widget data when no data is available
 */
function getDefaultWidgetData(): WidgetCacheData {
  return {
    temperature: '--°C',
    humidity: '--%',
    status: 'normal',
    statusColor: getStatusColor('normal'),
    statusIcon: getStatusIcon('normal'),
    location: 'Sin datos',
    lastUpdate: new Date().toISOString(),
    alerts: 0,
    isOffline: true,
    cachedAt: Date.now(),
  };
}


/**
 * Render the appropriate widget component based on widget name
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */
async function renderWidget(
  widgetId: number, 
  widgetName: string, 
  data: WidgetCacheData,
  isOffline: boolean
): Promise<void> {
  const isDarkMode = false; // TODO: Detect system theme
  const status = data.status as SensorStatus;

  try {
    switch (widgetName) {
      case WIDGET_NAMES.SMALL:
        await requestWidgetUpdate({
          widgetName: WIDGET_NAMES.SMALL,
          renderWidget: () => (
            <SmallWidgetNative
              temperature={data.temperature}
              humidity={data.humidity}
              status={status}
              location={data.location}
              isDarkMode={isDarkMode}
            />
          ),
          widgetKey: String(widgetId),
        });
        break;

      case WIDGET_NAMES.MEDIUM:
        await requestWidgetUpdate({
          widgetName: WIDGET_NAMES.MEDIUM,
          renderWidget: () => (
            <MediumWidgetNative
              temperature={data.temperature}
              humidity={data.humidity}
              status={status}
              location={data.location}
              lastUpdate={data.lastUpdate}
              alerts={data.alerts}
              isDarkMode={isDarkMode}
            />
          ),
          widgetKey: String(widgetId),
        });
        break;

      case WIDGET_NAMES.LARGE:
        await requestWidgetUpdate({
          widgetName: WIDGET_NAMES.LARGE,
          renderWidget: () => (
            <LargeWidgetNative
              temperature={data.temperature}
              humidity={data.humidity}
              status={status}
              location={data.location}
              actuator={data.statusIcon}
              lastUpdate={data.lastUpdate}
              alerts={data.alerts}
              isOffline={isOffline}
              isDarkMode={isDarkMode}
            />
          ),
          widgetKey: String(widgetId),
        });
        break;

      default:
        console.warn(`[WidgetTaskHandler] Unknown widget name: ${widgetName}`);
    }
    
    console.log(`[WidgetTaskHandler] Widget ${widgetName} (ID: ${widgetId}) updated successfully`);
  } catch (error) {
    console.error(`[WidgetTaskHandler] Error rendering widget:`, error);
  }
}

/**
 * Open the app to a specific section using deep linking
 * 
 * **Validates: Requirements 1.3, 5.3**
 */
async function openAppSection(section: string): Promise<void> {
  try {
    const url = `${APP_SCHEME}${section}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      console.log(`[WidgetTaskHandler] Opened app section: ${section}`);
    } else {
      console.warn(`[WidgetTaskHandler] Cannot open deep link, trying fallback`);
    }
  } catch (error) {
    console.error(`[WidgetTaskHandler] Error opening app section:`, error);
  }
}

/**
 * Get the current update interval based on battery state
 * Returns 15 minutes for normal mode, 30 minutes for battery saver mode
 * 
 * **Validates: Requirements 8.1, 8.2**
 */
export async function getCurrentUpdateInterval(): Promise<number> {
  try {
    const inPowerSaveMode = await isPowerSaveMode();
    const interval = getUpdateIntervalSync(inPowerSaveMode);
    console.log(`[WidgetTaskHandler] Current update interval: ${interval / 60000} minutes (power save: ${inPowerSaveMode})`);
    return interval;
  } catch (error) {
    console.warn('[WidgetTaskHandler] Error getting update interval, using default:', error);
    return NORMAL_UPDATE_INTERVAL_MS;
  }
}

/**
 * Check if the device is in battery saver mode
 * Exposed for external use
 * 
 * **Validates: Requirements 8.2**
 */
export async function isInBatterySaverMode(): Promise<boolean> {
  return await isPowerSaveMode();
}

export {
    BATTERY_SAVER_UPDATE_INTERVAL_MS,
    MAX_UPDATE_EXECUTION_TIME_MS, NORMAL_UPDATE_INTERVAL_MS, WIDGET_NAMES,
    WIDGET_TASK_NAME
};

