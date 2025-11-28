/**
 * Battery Optimization Utilities for SensorSP Native Android Widgets
 * Provides battery state detection and update interval management
 * 
 * **Feature: native-widgets**
 * **Validates: Requirements 8.1, 8.2, 8.3**
 */

import { NativeModules, Platform } from 'react-native';

// ============================================================================
// Update Interval Constants (Requirements 8.1, 8.2)
// ============================================================================

/**
 * Update interval in milliseconds for normal battery mode
 * As specified in Requirements 8.1: minimum 15 minutes
 */
export const NORMAL_UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Update interval in milliseconds for battery saver mode
 * As specified in Requirements 8.2: 30 minutes when in battery saver
 */
export const BATTERY_SAVER_UPDATE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Maximum execution time for widget updates in milliseconds
 * As specified in Requirements 8.3: complete within 10 seconds
 */
export const MAX_UPDATE_EXECUTION_TIME_MS = 10 * 1000; // 10 seconds

/**
 * Timeout for data fetching operations
 * Set slightly lower than MAX_UPDATE_EXECUTION_TIME_MS to allow for rendering
 */
export const DATA_FETCH_TIMEOUT_MS = 8 * 1000; // 8 seconds

// ============================================================================
// Battery State Types
// ============================================================================

/**
 * Battery state enumeration
 */
export type BatteryState = 'normal' | 'low' | 'critical' | 'charging';

/**
 * Battery information interface
 */
export interface BatteryInfo {
  level: number; // 0-100
  isCharging: boolean;
  isPowerSaveMode: boolean;
  state: BatteryState;
}

// ============================================================================
// Battery State Detection (Requirements 8.1, 8.2)
// ============================================================================

/**
 * Check if the device is in power save (battery saver) mode
 * Uses Android's PowerManager to detect battery saver state
 * 
 * @returns Promise<boolean> - true if device is in power save mode
 * 
 * **Validates: Requirements 8.2**
 */
export async function isPowerSaveMode(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    // Try to use native module if available
    const { PowerManager } = NativeModules;
    if (PowerManager && typeof PowerManager.isPowerSaveMode === 'function') {
      return await PowerManager.isPowerSaveMode();
    }
    
    // Fallback: check if battery level is low (below 20%)
    const batteryInfo = await getBatteryInfo();
    return batteryInfo.level < 20 && !batteryInfo.isCharging;
  } catch (error) {
    console.warn('[BatteryOptimization] Error checking power save mode:', error);
    return false;
  }
}

/**
 * Get current battery information
 * 
 * @returns Promise<BatteryInfo> - Current battery state information
 */
export async function getBatteryInfo(): Promise<BatteryInfo> {
  const defaultInfo: BatteryInfo = {
    level: 100,
    isCharging: false,
    isPowerSaveMode: false,
    state: 'normal',
  };

  if (Platform.OS !== 'android') {
    return defaultInfo;
  }

  try {
    const { BatteryModule } = NativeModules;
    if (BatteryModule && typeof BatteryModule.getBatteryInfo === 'function') {
      const info = await BatteryModule.getBatteryInfo();
      return {
        level: info.level ?? 100,
        isCharging: info.isCharging ?? false,
        isPowerSaveMode: info.isPowerSaveMode ?? false,
        state: determineBatteryState(info.level, info.isCharging),
      };
    }
    
    return defaultInfo;
  } catch (error) {
    console.warn('[BatteryOptimization] Error getting battery info:', error);
    return defaultInfo;
  }
}

/**
 * Determine battery state based on level and charging status
 * 
 * @param level - Battery level (0-100)
 * @param isCharging - Whether device is charging
 * @returns BatteryState
 */
function determineBatteryState(level: number, isCharging: boolean): BatteryState {
  if (isCharging) {
    return 'charging';
  }
  if (level <= 10) {
    return 'critical';
  }
  if (level <= 20) {
    return 'low';
  }
  return 'normal';
}

// ============================================================================
// Update Interval Management (Requirements 8.1, 8.2)
// ============================================================================

/**
 * Get the appropriate update interval based on current battery state
 * Returns 15 minutes for normal mode, 30 minutes for battery saver mode
 * 
 * @returns Promise<number> - Update interval in milliseconds
 * 
 * **Validates: Requirements 8.1, 8.2**
 */
export async function getUpdateInterval(): Promise<number> {
  const inPowerSaveMode = await isPowerSaveMode();
  
  if (inPowerSaveMode) {
    console.log('[BatteryOptimization] Power save mode detected, using 30-minute interval');
    return BATTERY_SAVER_UPDATE_INTERVAL_MS;
  }
  
  console.log('[BatteryOptimization] Normal mode, using 15-minute interval');
  return NORMAL_UPDATE_INTERVAL_MS;
}

/**
 * Get update interval synchronously (uses cached/default value)
 * Use this when async is not possible
 * 
 * @param isPowerSave - Whether device is in power save mode
 * @returns number - Update interval in milliseconds
 */
export function getUpdateIntervalSync(isPowerSave: boolean): number {
  return isPowerSave ? BATTERY_SAVER_UPDATE_INTERVAL_MS : NORMAL_UPDATE_INTERVAL_MS;
}

// ============================================================================
// Timeout Utilities (Requirements 8.3)
// ============================================================================

/**
 * Execute a promise with a timeout
 * Ensures operations complete within the specified time limit
 * 
 * @param promise - The promise to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param operationName - Name of the operation for logging
 * @returns Promise<T> - Result of the promise or throws on timeout
 * 
 * **Validates: Requirements 8.3**
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DATA_FETCH_TIMEOUT_MS,
  operationName: string = 'Operation'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Execute a data fetch operation with the standard timeout
 * Wrapper for common data fetching operations
 * 
 * @param fetchFn - The fetch function to execute
 * @returns Promise<T> - Result of the fetch or throws on timeout
 * 
 * **Validates: Requirements 8.3**
 */
export async function fetchWithTimeout<T>(
  fetchFn: () => Promise<T>
): Promise<T> {
  return withTimeout(fetchFn(), DATA_FETCH_TIMEOUT_MS, 'Data fetch');
}

/**
 * Check if there's enough time remaining for an operation
 * Used to prevent starting operations that might exceed the update window
 * 
 * @param startTime - When the update started (Date.now())
 * @param requiredMs - Minimum time required for the operation
 * @returns boolean - true if there's enough time
 */
export function hasTimeRemaining(startTime: number, requiredMs: number = 2000): boolean {
  const elapsed = Date.now() - startTime;
  const remaining = MAX_UPDATE_EXECUTION_TIME_MS - elapsed;
  return remaining >= requiredMs;
}

/**
 * Get remaining time in the update window
 * 
 * @param startTime - When the update started (Date.now())
 * @returns number - Remaining time in milliseconds
 */
export function getRemainingTime(startTime: number): number {
  const elapsed = Date.now() - startTime;
  return Math.max(0, MAX_UPDATE_EXECUTION_TIME_MS - elapsed);
}
