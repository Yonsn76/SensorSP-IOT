export {
    BATTERY_SAVER_UPDATE_INTERVAL_MS,
    MAX_UPDATE_EXECUTION_TIME_MS, NORMAL_UPDATE_INTERVAL_MS, WIDGET_NAMES,
    WIDGET_TASK_NAME, getCurrentUpdateInterval,
    isInBatterySaverMode, widgetTaskHandler
} from './WidgetTaskHandler';
export type { WidgetClickAction } from './WidgetTaskHandler';

// Native Widget Components
export { SmallWidgetNative } from './SmallWidgetNative';
export type { SmallWidgetNativeProps } from './SmallWidgetNative';

export { MediumWidgetNative } from './MediumWidgetNative';
export type { MediumWidgetNativeProps } from './MediumWidgetNative';

export { LargeWidgetNative } from './LargeWidgetNative';
export type { LargeWidgetNativeProps } from './LargeWidgetNative';

// Widget Configuration Screen
export { WidgetConfigScreen } from './WidgetConfigScreen';

// Widget utility functions
export {
    STATUS_COLORS,
    STATUS_ICONS, formatLastUpdate, formatRelativeTime, getStatusColor,
    getStatusIcon, getWidgetBackgroundColor,
    getWidgetTextColor, getWidgetThemeColors
} from './widgetUtils';
export type { SensorStatus, WidgetThemeColors } from './widgetUtils';

// Battery optimization utilities
export {
    DATA_FETCH_TIMEOUT_MS, fetchWithTimeout, getBatteryInfo, getRemainingTime, getUpdateInterval,
    getUpdateIntervalSync, hasTimeRemaining, isPowerSaveMode, withTimeout
} from './batteryOptimization';
export type { BatteryInfo, BatteryState } from './batteryOptimization';

