/**
 * Widget Utility Functions for SensorSP Native Android Widgets
 * Provides helper functions for status colors, time formatting, and theme colors
 * 
 * **Feature: native-widgets**
 */

// ============================================================================
// Status Color Mapping (Requirements 2.3)
// ============================================================================

/**
 * Sensor status types from the API
 */
export type SensorStatus = 'normal' | 'caliente' | 'frio';

/**
 * Status color configuration
 * Maps sensor status to display colors as specified in design document
 */
export const STATUS_COLORS = {
  normal: '#51CF66',   // Green - normal temperature
  caliente: '#FF6B6B', // Red - hot/high temperature
  frio: '#4ECDC4',     // Blue - cold/low temperature
} as const;

/**
 * Status icons for each sensor state
 */
export const STATUS_ICONS = {
  normal: '✓',
  caliente: '🔥',
  frio: '❄️',
} as const;

/**
 * Get the color code for a given sensor status
 * Maps 'normal' to green, 'caliente' to red, 'frio' to blue
 * 
 * @param status - The sensor status ('normal', 'caliente', 'frio')
 * @returns The hex color code for the status
 * 
 * **Validates: Requirements 2.3**
 */
export function getStatusColor(status: SensorStatus): string {
  return STATUS_COLORS[status] ?? STATUS_COLORS.normal;
}

/**
 * Get the icon for a given sensor status
 * 
 * @param status - The sensor status
 * @returns The icon string for the status
 */
export function getStatusIcon(status: SensorStatus): string {
  return STATUS_ICONS[status] ?? STATUS_ICONS.normal;
}


// ============================================================================
// Relative Time Formatting (Requirements 2.5)
// ============================================================================

/**
 * Time unit constants in milliseconds
 */
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Format a timestamp as relative time
 * Returns "X min", "X h", or "X d" format
 * 
 * @param timestamp - The timestamp to format (ISO string or Unix timestamp)
 * @returns Formatted relative time string (e.g., "5 min", "2 h", "1 d")
 * 
 * **Validates: Requirements 2.5**
 */
export function formatRelativeTime(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  
  // Handle invalid dates or future timestamps
  if (isNaN(diffMs) || diffMs < 0) {
    return '0 min';
  }
  
  // Less than 1 hour: show minutes
  if (diffMs < MS_PER_HOUR) {
    const minutes = Math.floor(diffMs / MS_PER_MINUTE);
    return `${Math.max(0, minutes)} min`;
  }
  
  // Less than 1 day: show hours
  if (diffMs < MS_PER_DAY) {
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    return `${hours} h`;
  }
  
  // 1 day or more: show days
  const days = Math.floor(diffMs / MS_PER_DAY);
  return `${days} d`;
}

/**
 * Format a timestamp for display in the widget
 * Returns a user-friendly "hace X min/h/d" format in Spanish
 * 
 * @param timestamp - The timestamp to format
 * @returns Formatted string like "hace 5 min"
 */
export function formatLastUpdate(timestamp: string | number): string {
  return `hace ${formatRelativeTime(timestamp)}`;
}


// ============================================================================
// Theme Color Utility (Requirements 7.1, 7.2)
// ============================================================================

/**
 * Widget theme colors interface
 * Defines all colors needed for widget rendering
 */
export interface WidgetThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  cardBackground: string;
  statusNormal: string;
  statusHot: string;
  statusCold: string;
  alertBadge: string;
  offlineIndicator: string;
  refreshButton: string;
}

/**
 * Light theme colors for widgets
 * As specified in design document: background=#FFFFFF
 */
const LIGHT_THEME: WidgetThemeColors = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: 'rgba(0, 0, 0, 0.1)',
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  statusNormal: STATUS_COLORS.normal,
  statusHot: STATUS_COLORS.caliente,
  statusCold: STATUS_COLORS.frio,
  alertBadge: '#FF3B30',
  offlineIndicator: '#FF9500',
  refreshButton: '#007AFF',
};

/**
 * Dark theme colors for widgets
 * As specified in design document: background=#1a1a1a
 */
const DARK_THEME: WidgetThemeColors = {
  background: '#1a1a1a',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: 'rgba(255, 255, 255, 0.1)',
  cardBackground: 'rgba(28, 28, 30, 0.9)',
  statusNormal: STATUS_COLORS.normal,
  statusHot: STATUS_COLORS.caliente,
  statusCold: STATUS_COLORS.frio,
  alertBadge: '#FF453A',
  offlineIndicator: '#FF9F0A',
  refreshButton: '#0A84FF',
};

/**
 * Get theme colors for widget rendering
 * Returns appropriate colors for dark or light mode
 * 
 * @param isDarkMode - Whether the device is in dark mode
 * @returns Theme colors object for widget rendering
 * 
 * **Validates: Requirements 7.1, 7.2**
 */
export function getWidgetThemeColors(isDarkMode: boolean): WidgetThemeColors {
  return isDarkMode ? DARK_THEME : LIGHT_THEME;
}

/**
 * Get the background color for a specific theme
 * Convenience function for quick access to background color
 * 
 * @param isDarkMode - Whether the device is in dark mode
 * @returns The background color hex code
 */
export function getWidgetBackgroundColor(isDarkMode: boolean): string {
  return isDarkMode ? DARK_THEME.background : LIGHT_THEME.background;
}

/**
 * Get the text color for a specific theme
 * Convenience function for quick access to text color
 * 
 * @param isDarkMode - Whether the device is in dark mode
 * @returns The text color hex code
 */
export function getWidgetTextColor(isDarkMode: boolean): string {
  return isDarkMode ? DARK_THEME.text : LIGHT_THEME.text;
}
