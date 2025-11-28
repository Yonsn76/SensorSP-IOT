import React from 'react';
import {
    FlexWidget,
    TextWidget,
} from 'react-native-android-widget';
import { formatLastUpdate, getStatusColor, getWidgetThemeColors, SensorStatus } from './widgetUtils';

/**
 * Native Android Widget Component - Large (4x4)
 * Full dashboard with all sensor data, alerts section, and action buttons
 * Includes offline indicator when displaying cached data
 * 
 * **Feature: native-widgets**
 * **Validates: Requirements 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 6.2**
 */

export interface LargeWidgetNativeProps {
  temperature: string;
  humidity: string;
  status: SensorStatus;
  location: string;
  actuator: string;
  lastUpdate: string;
  alerts: number;
  isOffline: boolean;
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
 * LargeWidgetNative - 4x4 native Android widget
 * Full dashboard display with all sensor information and actions
 */
export function LargeWidgetNative({
  temperature,
  humidity,
  status,
  location,
  actuator,
  lastUpdate,
  alerts,
  isOffline,
  isDarkMode,
}: LargeWidgetNativeProps): React.JSX.Element {
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
        borderRadius: 20,
        padding: 16,
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
              fontSize: 18,
            }}
          />
          <TextWidget
            text="Dashboard IoT"
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: theme.text,
              marginLeft: 6,
            }}
          />
        </FlexWidget>
        
        {/* Offline indicator and refresh button */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {isOffline && (
            <FlexWidget
              style={{
                backgroundColor: theme.offlineIndicator,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <TextWidget
                text="📴 Offline"
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: '#FFFFFF',
                }}
              />
            </FlexWidget>
          )}
          <FlexWidget
            style={{
              padding: 4,
            }}
            clickAction="REFRESH"
            clickActionData={{ widgetType: 'large' }}
          >
            <TextWidget
              text="🔄"
              style={{
                fontSize: 18,
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* Status section */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
          marginTop: 8,
        }}
      >
        <TextWidget
          text={statusEmoji}
          style={{
            fontSize: 22,
          }}
        />
        <TextWidget
          text={status.charAt(0).toUpperCase() + status.slice(1)}
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: statusColor,
            marginLeft: 6,
          }}
        />
      </FlexWidget>

      {/* Data grid - Temperature and Humidity */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: 'match_parent',
          marginTop: 12,
        }}
      >
        {/* Temperature */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <TextWidget
            text="🌡️"
            style={{
              fontSize: 24,
            }}
          />
          <TextWidget
            text="Temperatura"
            style={{
              fontSize: 10,
              color: theme.textSecondary,
              marginTop: 4,
            }}
          />
          <TextWidget
            text={temperature}
            style={{
              fontSize: 18,
              fontWeight: '700',
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
            flex: 1,
          }}
        >
          <TextWidget
            text="💧"
            style={{
              fontSize: 24,
            }}
          />
          <TextWidget
            text="Humedad"
            style={{
              fontSize: 10,
              color: theme.textSecondary,
              marginTop: 4,
            }}
          />
          <TextWidget
            text={humidity}
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#4ECDC4',
              marginTop: 2,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Location section */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          marginTop: 12,
        }}
      >
        <TextWidget
          text="📍"
          style={{
            fontSize: 14,
          }}
        />
        <TextWidget
          text={location}
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: theme.text,
            marginLeft: 8,
            flex: 1,
          }}
          truncate="END"
          maxLines={1}
        />
      </FlexWidget>

      {/* Actuator section */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          marginTop: 8,
        }}
      >
        <TextWidget
          text="⚙️"
          style={{
            fontSize: 14,
          }}
        />
        <TextWidget
          text="Actuador:"
          style={{
            fontSize: 11,
            color: theme.textSecondary,
            marginLeft: 8,
          }}
        />
        <TextWidget
          text={actuator}
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#4ECDC4',
            marginLeft: 6,
          }}
        />
      </FlexWidget>

      {/* Alerts section - only show if alerts > 0 */}
      {alerts > 0 && (
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: 'match_parent',
            backgroundColor: 'rgba(255, 212, 59, 0.15)',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(255, 212, 59, 0.3)',
            marginTop: 8,
          }}
          clickAction="OPEN_ALERTS"
          clickActionData={{ action: 'alerts' }}
        >
          <TextWidget
            text="⚠️"
            style={{
              fontSize: 14,
            }}
          />
          <TextWidget
            text={`${alerts} Alertas Activas`}
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#FFD43B',
              marginLeft: 8,
            }}
          />
        </FlexWidget>
      )}

      {/* Last update */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'match_parent',
          marginTop: 8,
        }}
      >
        <TextWidget
          text="🕐"
          style={{
            fontSize: 10,
          }}
        />
        <TextWidget
          text={`Última actualización: ${formattedLastUpdate}`}
          style={{
            fontSize: 10,
            color: theme.textSecondary,
            marginLeft: 4,
          }}
        />
      </FlexWidget>

      {/* Action buttons */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 'match_parent',
          marginTop: 10,
        }}
      >
        {/* Refresh button */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 6,
          }}
          clickAction="REFRESH"
          clickActionData={{ widgetType: 'large' }}
        >
          <TextWidget
            text="🔄"
            style={{
              fontSize: 12,
            }}
          />
          <TextWidget
            text="Actualizar"
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: theme.text,
              marginLeft: 4,
            }}
          />
        </FlexWidget>

        {/* Open app button */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: theme.refreshButton,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 6,
          }}
          clickAction="OPEN_APP"
          clickActionData={{ action: 'dashboard' }}
        >
          <TextWidget
            text="📱"
            style={{
              fontSize: 12,
            }}
          />
          <TextWidget
            text="Ver App"
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: '#FFFFFF',
              marginLeft: 4,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

export default LargeWidgetNative;
