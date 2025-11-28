import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { requestWidgetUpdate, WidgetConfigurationScreenProps } from 'react-native-android-widget';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { sensorApi, SensorData } from '../../services/sensorApi';
import { WidgetConfig, WidgetStorageService } from '../../services/widgetStorageService';
import { LargeWidgetNative } from './LargeWidgetNative';
import { MediumWidgetNative } from './MediumWidgetNative';
import { SmallWidgetNative } from './SmallWidgetNative';
import { getStatusColor, getStatusIcon, SensorStatus } from './widgetUtils';

/**
 * Widget Configuration Screen Component
 * Allows users to select which sensor to display on their widget
 * Handles edge cases: no sensors available, user not authenticated
 * 
 * This component is registered as the configuration activity for all widgets.
 * It is shown when:
 * - A user adds a new widget to the home screen (Requirement 4.1)
 * - A user long-presses an existing widget and selects reconfigure (Requirement 4.3)
 * 
 * **Feature: native-widgets**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
 */

// Props interface extends the library's configuration screen props
interface WidgetConfigScreenProps extends Partial<WidgetConfigurationScreenProps> {
  // Legacy props for backward compatibility
  widgetId?: number;
  widgetName?: string;
  onConfigComplete?: () => void;
}

interface SensorOption {
  sensorId: string;
  name: string;
  location: string;
  lastReading: SensorData | null;
}

type ConfigState = 'loading' | 'not_authenticated' | 'no_sensors' | 'ready' | 'error';

// Widget name constants for identification
const WIDGET_NAMES = {
  SMALL: 'SensorSPSmallWidget',
  MEDIUM: 'SensorSPMediumWidget',
  LARGE: 'SensorSPLargeWidget',
} as const;

export const WidgetConfigScreen: React.FC<WidgetConfigScreenProps> = (props) => {
  // Extract widget info from library props or legacy props
  const widgetInfo = props.widgetInfo;
  const widgetId = widgetInfo?.widgetId ?? props.widgetId ?? 0;
  const widgetName = widgetInfo?.widgetName ?? props.widgetName ?? WIDGET_NAMES.SMALL;
  const setResult = props.setResult;
  const renderWidget = props.renderWidget;
  const onConfigComplete = props.onConfigComplete;

  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { isDark } = useTheme();
  
  const [configState, setConfigState] = useState<ConfigState>('loading');
  const [sensors, setSensors] = useState<SensorOption[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Theme colors
  const colors = {
    background: isDark ? '#1a1a1a' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#CCCCCC' : '#666666',
    cardBackground: isDark ? '#2c2c2e' : '#F5F5F5',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    primary: '#007AFF',
    error: '#FF3B30',
    warning: '#FF9500',
  };


  // Load sensors and check authentication state
  useEffect(() => {
    const loadSensors = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Check authentication first (Requirement 4.4)
      if (!isAuthenticated || !user) {
        setConfigState('not_authenticated');
        return;
      }

      try {
        setConfigState('loading');
        const allSensors = await sensorApi.getAllSensors();
        
        // Check if no sensors available (Requirement 4.4)
        if (!allSensors || allSensors.length === 0) {
          setConfigState('no_sensors');
          return;
        }

        // Group sensors by sensorId and get the latest reading for each
        const sensorMap = new Map<string, SensorOption>();
        
        allSensors.forEach((sensor) => {
          const sensorId = sensor.sensorId || sensor._id;
          if (!sensorMap.has(sensorId)) {
            sensorMap.set(sensorId, {
              sensorId,
              name: sensor.tipo || sensor.modelo || `Sensor ${sensorId.slice(-4)}`,
              location: sensor.ubicacion || 'Sin ubicación',
              lastReading: sensor,
            });
          }
        });

        const sensorOptions = Array.from(sensorMap.values());
        setSensors(sensorOptions);
        
        // Load existing config if any
        const existingConfig = await WidgetStorageService.getWidgetConfig(widgetId);
        if (existingConfig) {
          setSelectedSensorId(existingConfig.sensorId);
        } else if (sensorOptions.length > 0) {
          // Default to first sensor
          setSelectedSensorId(sensorOptions[0].sensorId);
        }
        
        setConfigState('ready');
      } catch (error) {
        console.error('[WidgetConfigScreen] Error loading sensors:', error);
        setErrorMessage('Error al cargar los sensores. Intenta de nuevo.');
        setConfigState('error');
      }
    };

    loadSensors();
  }, [isAuthenticated, user, authLoading, widgetId]);

  // Handle sensor selection and save configuration
  const handleSensorSelect = async (sensorId: string) => {
    setSelectedSensorId(sensorId);
  };

  /**
   * Render the appropriate widget component based on widget name
   * Used to update the widget after configuration is saved
   */
  const getWidgetComponent = (data: {
    temperature: string;
    humidity: string;
    status: SensorStatus;
    location: string;
    lastUpdate: string;
    alerts: number;
    isOffline: boolean;
  }) => {
    switch (widgetName) {
      case WIDGET_NAMES.SMALL:
        return (
          <SmallWidgetNative
            temperature={data.temperature}
            humidity={data.humidity}
            status={data.status}
            location={data.location}
            isDarkMode={isDark}
          />
        );
      case WIDGET_NAMES.MEDIUM:
        return (
          <MediumWidgetNative
            temperature={data.temperature}
            humidity={data.humidity}
            status={data.status}
            location={data.location}
            lastUpdate={data.lastUpdate}
            alerts={data.alerts}
            isDarkMode={isDark}
          />
        );
      case WIDGET_NAMES.LARGE:
        return (
          <LargeWidgetNative
            temperature={data.temperature}
            humidity={data.humidity}
            status={data.status}
            location={data.location}
            actuator="--"
            lastUpdate={data.lastUpdate}
            alerts={data.alerts}
            isOffline={data.isOffline}
            isDarkMode={isDark}
          />
        );
      default:
        return (
          <SmallWidgetNative
            temperature={data.temperature}
            humidity={data.humidity}
            status={data.status}
            location={data.location}
            isDarkMode={isDark}
          />
        );
    }
  };

  // Save configuration and update widget
  const handleSaveConfig = async () => {
    if (!selectedSensorId || !user) return;

    setIsSaving(true);
    try {
      const selectedSensor = sensors.find(s => s.sensorId === selectedSensorId);
      if (!selectedSensor) {
        throw new Error('Sensor no encontrado');
      }

      const config: WidgetConfig = {
        sensorId: selectedSensorId,
        sensorName: selectedSensor.name,
        userId: user.id,
        theme: 'auto',
      };

      await WidgetStorageService.setWidgetConfig(widgetId, config);
      console.log(`[WidgetConfigScreen] Configuration saved for widget ${widgetId}`);

      // Prepare widget data from the selected sensor's last reading
      const sensorData = selectedSensor.lastReading;
      const status = (sensorData?.estado as SensorStatus) || 'normal';
      const widgetData = {
        temperature: sensorData ? `${sensorData.temperatura}°C` : '--°C',
        humidity: sensorData ? `${sensorData.humedad}%` : '--%',
        status,
        location: selectedSensor.location,
        lastUpdate: sensorData?.fecha || new Date().toISOString(),
        alerts: 0,
        isOffline: false,
      };

      // If using the library's renderWidget prop, use it to update the widget
      if (renderWidget) {
        renderWidget(getWidgetComponent(widgetData));
      } else {
        // Fallback: Use requestWidgetUpdate directly
        await requestWidgetUpdate({
          widgetName,
          renderWidget: () => getWidgetComponent(widgetData),
          widgetKey: String(widgetId),
        });
      }

      // Signal configuration completion to the Android system
      // This tells Android that the widget was configured successfully
      if (setResult) {
        setResult('ok');
        console.log(`[WidgetConfigScreen] Configuration result set to 'ok' for widget ${widgetId}`);
      }

      // Call legacy callback if provided
      onConfigComplete?.();
    } catch (error) {
      console.error('[WidgetConfigScreen] Error saving config:', error);
      setErrorMessage('Error al guardar la configuración');
      
      // Signal configuration cancellation on error
      if (setResult) {
        setResult('cancel');
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle configuration cancellation
   * Called when user dismisses the configuration screen without saving
   */
  const handleCancel = () => {
    if (setResult) {
      setResult('cancel');
      console.log(`[WidgetConfigScreen] Configuration cancelled for widget ${widgetId}`);
    }
    onConfigComplete?.();
  };


  // Render not authenticated state (Requirement 4.4)
  const renderNotAuthenticated = () => (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      <Ionicons name="lock-closed-outline" size={64} color={colors.warning} />
      <Text style={[styles.title, { color: colors.text }]}>
        Inicia sesión requerido
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Para configurar el widget, primero debes iniciar sesión en la aplicación SensorSP.
      </Text>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleCancel}
      >
        <Text style={styles.buttonText}>Abrir aplicación</Text>
      </TouchableOpacity>
    </View>
  );

  // Render no sensors available state (Requirement 4.4)
  const renderNoSensors = () => (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      <Ionicons name="thermometer-outline" size={64} color={colors.warning} />
      <Text style={[styles.title, { color: colors.text }]}>
        No hay sensores disponibles
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        No se encontraron sensores configurados. Agrega sensores en la aplicación SensorSP para poder mostrarlos en el widget.
      </Text>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleCancel}
      >
        <Text style={styles.buttonText}>Agregar sensores</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={[styles.title, { color: colors.text }]}>
        Error
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {errorMessage}
      </Text>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={() => setConfigState('loading')}
      >
        <Text style={styles.buttonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Cargando sensores...
      </Text>
    </View>
  );

  // Render sensor item
  const renderSensorItem = ({ item }: { item: SensorOption }) => {
    const isSelected = selectedSensorId === item.sensorId;
    const status = item.lastReading?.estado as SensorStatus || 'normal';
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);

    return (
      <TouchableOpacity
        style={[
          styles.sensorItem,
          { 
            backgroundColor: colors.cardBackground,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSensorSelect(item.sensorId)}
      >
        <View style={styles.sensorInfo}>
          <View style={styles.sensorHeader}>
            <Text style={[styles.sensorName, { color: colors.text }]}>
              {item.name}
            </Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.sensorLocation, { color: colors.textSecondary }]}>
            📍 {item.location}
          </Text>
          {item.lastReading && (
            <View style={styles.sensorReadings}>
              <Text style={[styles.reading, { color: colors.text }]}>
                🌡️ {item.lastReading.temperatura}°C
              </Text>
              <Text style={[styles.reading, { color: colors.text }]}>
                💧 {item.lastReading.humedad}%
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>
                  {statusIcon} {status}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };


  // Render sensor list (ready state)
  const renderSensorList = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Configurar Widget
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Selecciona el sensor que deseas mostrar en tu widget
        </Text>
      </View>

      <FlatList
        data={sensors}
        renderItem={renderSensorItem}
        keyExtractor={(item) => item.sensorId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { 
              backgroundColor: selectedSensorId ? colors.primary : colors.border,
              opacity: selectedSensorId && !isSaving ? 1 : 0.6,
            },
          ]}
          onPress={handleSaveConfig}
          disabled={!selectedSensorId || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar configuración</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main render based on state
  switch (configState) {
    case 'loading':
      return renderLoading();
    case 'not_authenticated':
      return renderNotAuthenticated();
    case 'no_sensors':
      return renderNoSensors();
    case 'error':
      return renderError();
    case 'ready':
      return renderSensorList();
    default:
      return renderLoading();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  sensorItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  sensorLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  sensorReadings: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  reading: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WidgetConfigScreen;
