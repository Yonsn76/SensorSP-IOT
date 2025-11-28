import React from 'react';
import {
    ClickActionProps,
    FlexWidget,
    TextWidget,
} from 'react-native-android-widget';
import { getStatusColor, getWidgetThemeColors, SensorStatus } from './widgetUtils';

/**
 * Native Android Widget Component - Small (2x2)
 * Displays temperature, humidity, status icon, and location
 * 
 * **Feature: native-widgets**
 * **Validates: Requirements 1.1, 2.1, 2.2, 2.3, 2.4**
 */

export interface SmallWidgetNativeProps {
  temperature: string;
  humidity: string;
  status: SensorStatus;
  location: string;
  isDarkMode: boolean;
}

/**
 * Get status emoji icon for display
 */
function getStatusEmoji(status: SensorStatus): string {
  switch (status) {
    case 'caliente':
      return '🔥';
    case 'frio':
      return '❄️';
    case 'normal':
    default:
      return '✓';
  }
}

/**
 * SmallWidgetNative - 2x2 native Android widget
 * Compact display of sensor data for home screen
 */
export function SmallWidgetNative({
  temperature,
  humidity,
  status,
  location,
  isDarkMode,
}: SmallWidgetNativeProps): React.JSX.Element {
  const theme = getWidgetThemeColors(isDarkMode);
  const statusColor = getStatusColor(status);
  const statusEmoji = getStatusEmoji(status);

  // Click action to open the app
  const clickAction: ClickActionProps = {
    clickAction: 'OPEN_APP',
  };

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
      clickActionData={{ action: 'dashboard' }}
    >
      {/* Header with status */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text={statusEmoji}
          style={{
            fontSize: 14,
          }}
        />
        <TextWidget
          text={status.charAt(0).toUpperCase() + status.slice(1)}
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: statusColor,
            marginLeft: 4,
          }}
        />
      </FlexWidget>

      {/* Temperature row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="🌡️"
          style={{
            fontSize: 14,
          }}
        />
        <TextWidget
          text={temperature}
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#FF6B6B',
            marginLeft: 6,
          }}
        />
      </FlexWidget>

      {/* Humidity row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="💧"
          style={{
            fontSize: 14,
          }}
        />
        <TextWidget
          text={humidity}
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#4ECDC4',
            marginLeft: 6,
          }}
        />
      </FlexWidget>

      {/* Location */}
      <TextWidget
        text={location}
        style={{
          fontSize: 11,
          color: theme.text,
          width: 'match_parent',
        }}
        truncate="END"
        maxLines={1}
      />
    </FlexWidget>
  );
}

export default SmallWidgetNative;
