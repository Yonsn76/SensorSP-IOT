import React from 'react';
import {
    FlexWidget,
    TextWidget,
} from 'react-native-android-widget';
import { formatLastUpdate, getStatusColor, getWidgetThemeColors, SensorStatus } from './widgetUtils';

/**
 * Native Android Widget Component - Medium (4x2)
 * Displays temperature, humidity, status, location, refresh button, and last update time
 * Includes alert badge when alerts > 0
 * 
 * **Feature: native-widgets**
 * **Validates: Requirements 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1**
 */

export interface MediumWidgetNativeProps {
  temperature: string;
  humidity: string;
  status: SensorStatus;
  location: string;
  lastUpdate: string;
  alerts: number;
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
 * MediumWidgetNative - 4x2 native Android widget
 * Extended display with more sensor details and refresh capability
 */
export function MediumWidgetNative({
  temperature,
  humidity,
  status,
  location,
  lastUpdate,
  alerts,
  isDarkMode,
}: MediumWidgetNativeProps): React.JSX.Element {
  const theme = getWidgetThemeColors(isDarkMode);
  const statusColor = getStatusColor(status);
  const statusEmoji = getStatusEmoji(status);
  const formattedLastUpdate = formatLastUpdate(lastUpdate);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
      clickActionData={{ action: 'dashboard' }}
    >
      {/* Header with title and refresh button */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="📊"
            style={{
              fontSize: 16,
            }}
          />
          <TextWidget
            text="Estado del Sistema"
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: theme.text,
              marginLeft: 6,
            }}
          />
        </FlexWidget>
        
        {/* Refresh button */}
        <FlexWidget
          style={{
            padding: 4,
          }}
          clickAction="REFRESH"
          clickActionData={{ widgetType: 'medium' }}
        >
          <TextWidget
            text="🔄"
            style={{
              fontSize: 16,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Data grid - Temperature, Humidity, Status */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        {/* Temperature */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="🌡️"
            style={{
              fontSize: 18,
            }}
          />
          <TextWidget
            text={temperature}
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#FF6B6B',
              marginTop: 2,
            }}
          />
        </FlexWidget>

        {/* Humidity */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="💧"
            style={{
              fontSize: 18,
            }}
          />
          <TextWidget
            text={humidity}
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#4ECDC4',
              marginTop: 2,
            }}
          />
        </FlexWidget>

        {/* Status */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text={statusEmoji}
            style={{
              fontSize: 18,
            }}
          />
          <TextWidget
            text={status.charAt(0).toUpperCase() + status.slice(1)}
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: statusColor,
              marginTop: 2,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Location row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="📍"
          style={{
            fontSize: 12,
          }}
        />
        <TextWidget
          text={location}
          style={{
            fontSize: 11,
            color: theme.text,
            marginLeft: 4,
            flex: 1,
          }}
          truncate="END"
          maxLines={1}
        />
      </FlexWidget>

      {/* Footer with last update and alerts */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        {/* Last update */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="🕐"
            style={{
              fontSize: 10,
            }}
          />
          <TextWidget
            text={formattedLastUpdate}
            style={{
              fontSize: 9,
              color: theme.textSecondary,
              marginLeft: 2,
            }}
          />
        </FlexWidget>

        {/* Alert badge - only show if alerts > 0 */}
        {alerts > 0 && (
          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.alertBadge,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 10,
            }}
            clickAction="OPEN_ALERTS"
            clickActionData={{ action: 'alerts' }}
          >
            <TextWidget
              text="⚠️"
              style={{
                fontSize: 10,
              }}
            />
            <TextWidget
              text={`${alerts}`}
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: '#FFFFFF',
                marginLeft: 2,
              }}
            />
          </FlexWidget>
        )}
      </FlexWidget>
    </FlexWidget>
  );
}

export default MediumWidgetNative;
