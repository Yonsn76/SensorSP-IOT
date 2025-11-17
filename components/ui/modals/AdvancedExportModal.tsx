import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getThemeColors } from '../../../constants/Colors';
import { useTheme } from '../../../contexts/ThemeContext';
import { ExportOptions, exportService } from '../../../services/exportService';
import { CustomDateRangeSelector, DateRange } from '../inputs';
import { LiquidGlassButton } from '../buttons';
import { LiquidGlassModal } from './LiquidGlassModal';

interface AdvancedExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdvancedExportModal({ visible, onClose }: AdvancedExportModalProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [isExporting, setIsExporting] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeSensors: true,
    includeNotifications: true,
    includeSettings: true,
    includeStats: true,
    sensorFilters: {
      includeTemperature: true,
      includeHumidity: true,
      includeStatus: true,
      includeActuator: true,
    },
    dataOptions: {
      includeAllHistorical: false,
      maxRecords: 1000,
      groupByHour: false,
      groupByDay: false,
      includeRawData: true,
      includeProcessedData: false,
    },
    exportStructure: {
      separateFiles: false,
      includeMetadata: true,
      includeCharts: false,
      includeSummary: true,
    },
  });

  const formats = [
    { key: 'csv', label: 'CSV', icon: 'document-text-outline', description: 'Archivo de texto con datos tabulados' },
    { key: 'json', label: 'JSON', icon: 'code-outline', description: 'Datos estructurados para análisis' },
    { key: 'pdf', label: 'PDF', icon: 'document-outline', description: 'Reporte profesional con gráficos' },
  ];

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      console.log('🔄 Iniciando exportación avanzada...');
      
      // Validar que al menos una opción esté seleccionada
      const hasContent = exportOptions.includeSensors || exportOptions.includeNotifications || 
                        exportOptions.includeSettings || exportOptions.includeStats;
      if (!hasContent) {
        Alert.alert(
          'Selección Requerida',
          'Debe seleccionar al menos un tipo de contenido para exportar.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Exportar datos
      const fileUri = await exportService.exportData(exportOptions);
      
      // Compartir archivo
      await exportService.shareFile(fileUri);
      
      Alert.alert(
        'Exportación Completada',
        'Los datos han sido exportados y compartidos exitosamente.',
        [{ text: 'OK', onPress: onClose }]
      );
      
    } catch (error) {
      console.error('  Error en exportación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        'Error en Exportación',
        `No se pudo exportar los datos: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    try {
      console.log('👁️ Generando vista previa...');
      const data = await exportService.collectData(exportOptions);
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('  Error generando vista previa:', error);
      Alert.alert(
        'Error en Vista Previa',
        'No se pudo generar la vista previa de los datos.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDateRangeSelect = (dateRange: DateRange) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        start: dateRange.startDate.toISOString(),
        end: dateRange.endDate.toISOString(),
      }
    }));
    setShowDateSelector(false);
  };

  const getDateRangeLabel = () => {
    if (exportOptions.dateRange) {
      const start = new Date(exportOptions.dateRange.start).toLocaleDateString('es-ES');
      const end = new Date(exportOptions.dateRange.end).toLocaleDateString('es-ES');
      return `${start} - ${end}`;
    }
    return exportOptions.dataOptions?.includeAllHistorical ? 'Todos los datos históricos' : 'Últimas 24 horas';
  };

  const toggleOption = (key: keyof ExportOptions) => {
    if (key === 'format') return;
    setExportOptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSensorFilter = (key: keyof NonNullable<ExportOptions['sensorFilters']>) => {
    setExportOptions(prev => ({
      ...prev,
      sensorFilters: {
        ...prev.sensorFilters,
        [key]: !prev.sensorFilters?.[key],
      } as NonNullable<ExportOptions['sensorFilters']>,
    }));
  };

  const toggleDataOption = (key: keyof NonNullable<ExportOptions['dataOptions']>) => {
    setExportOptions(prev => ({
      ...prev,
      dataOptions: {
        ...prev.dataOptions,
        [key]: !prev.dataOptions?.[key],
      } as NonNullable<ExportOptions['dataOptions']>,
    }));
  };

  const toggleStructureOption = (key: keyof NonNullable<ExportOptions['exportStructure']>) => {
    setExportOptions(prev => ({
      ...prev,
      exportStructure: {
        ...prev.exportStructure,
        [key]: !prev.exportStructure?.[key],
      } as NonNullable<ExportOptions['exportStructure']>,
    }));
  };

  const updateMaxRecords = (value: string) => {
    const numValue = parseInt(value) || 0;
    setExportOptions(prev => ({
      ...prev,
      dataOptions: {
        ...prev.dataOptions,
        maxRecords: numValue,
      } as NonNullable<ExportOptions['dataOptions']>,
    }));
  };

  const styles = StyleSheet.create({
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 15,
    },
    formatGrid: {
      gap: 12,
    },
    formatButton: {
      backgroundColor: colors.secondaryButton,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.secondaryButtonBorder,
    },
    formatButtonSelected: {
      backgroundColor: colors.primaryButton,
      borderColor: colors.primaryButton,
    },
    formatLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    formatDescription: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    formatLabelSelected: {
      color: '#FFFFFF',
    },
    formatDescriptionSelected: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    optionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    optionItemLast: {
      borderBottomWidth: 0,
    },
    optionLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    optionDescription: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginTop: 2,
    },
    dateRangeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondaryButton,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.secondaryButtonBorder,
      marginBottom: 8,
    },
    dateRangeText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
      marginLeft: 12,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    input: {
      backgroundColor: colors.secondaryButton,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.secondaryButtonBorder,
      flex: 1,
      marginRight: 12,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.text,
      marginRight: 8,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
    },
    footerRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    footerButton: {
      flex: 1,
      minHeight: 44,
    },
    previewContainer: {
      backgroundColor: colors.secondaryButton,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    previewText: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      lineHeight: 20,
    },
  });

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      maxHeight="85%"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
          {' '}Exportación Avanzada
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Formato de exportación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="options-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
            {' '}Formato de Exportación
          </Text>
          <View style={styles.formatGrid}>
            {formats.map((format) => (
              <TouchableOpacity
                key={format.key}
                style={[
                  styles.formatButton,
                  exportOptions.format === format.key && styles.formatButtonSelected,
                ]}
                onPress={() => setExportOptions(prev => ({ ...prev, format: format.key as any }))}
                disabled={isExporting}
              >
                <Ionicons 
                  name={format.icon as any} 
                  size={24} 
                  color={exportOptions.format === format.key ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#1D1D1F')} 
                />
                <Text
                  style={[
                    styles.formatLabel,
                    exportOptions.format === format.key && styles.formatLabelSelected,
                  ]}
                >
                  {format.label}
                </Text>
                <Text
                  style={[
                    styles.formatDescription,
                    exportOptions.format === format.key && styles.formatDescriptionSelected,
                  ]}
                >
                  {format.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rango de fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
            {' '}Rango de Datos
          </Text>
          <TouchableOpacity
            style={styles.dateRangeButton}
            onPress={() => setShowDateSelector(true)}
            disabled={isExporting}
          >
            <Ionicons name="calendar-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
            <Text style={styles.dateRangeText}>{getDateRangeLabel()}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
          </TouchableOpacity>
          
          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="archive-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Incluir Todos los Datos Históricos
              </Text>
              <Text style={styles.optionDescription}>
                Exportar todos los datos disponibles (puede ser lento)
              </Text>
            </View>
            <Switch
              value={exportOptions.dataOptions?.includeAllHistorical || false}
              onValueChange={() => toggleDataOption('includeAllHistorical')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={(exportOptions.dataOptions?.includeAllHistorical || false) ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {!exportOptions.dataOptions?.includeAllHistorical && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Máximo de registros:</Text>
              <TextInput
                style={styles.input}
                value={exportOptions.dataOptions?.maxRecords?.toString() || '1000'}
                onChangeText={updateMaxRecords}
                keyboardType="numeric"
                placeholder="1000"
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
              />
            </View>
          )}
        </View>

        {/* Filtros de sensores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="filter-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
            {' '}Filtros de Sensores
          </Text>
          
          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="thermometer-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Incluir Temperatura
              </Text>
            </View>
            <Switch
              value={exportOptions.sensorFilters?.includeTemperature !== false}
              onValueChange={() => toggleSensorFilter('includeTemperature')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={(exportOptions.sensorFilters?.includeTemperature !== false) ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="water-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Incluir Humedad
              </Text>
            </View>
            <Switch
              value={exportOptions.sensorFilters?.includeHumidity !== false}
              onValueChange={() => toggleSensorFilter('includeHumidity')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={(exportOptions.sensorFilters?.includeHumidity !== false) ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="checkmark-circle-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Incluir Estado
              </Text>
            </View>
            <Switch
              value={exportOptions.sensorFilters?.includeStatus !== false}
              onValueChange={() => toggleSensorFilter('includeStatus')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={(exportOptions.sensorFilters?.includeStatus !== false) ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.optionItem, styles.optionItemLast]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="settings-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Incluir Actuador
              </Text>
            </View>
            <Switch
              value={exportOptions.sensorFilters?.includeActuator !== false}
              onValueChange={() => toggleSensorFilter('includeActuator')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={(exportOptions.sensorFilters?.includeActuator !== false) ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Opciones de contenido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="list-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
            {' '}Contenido a Exportar
          </Text>
          
          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="thermometer-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Datos de Sensores
              </Text>
              <Text style={styles.optionDescription}>
                Incluir todas las lecturas de temperatura y humedad
              </Text>
            </View>
            <Switch
              value={exportOptions.includeSensors}
              onValueChange={() => toggleOption('includeSensors')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={exportOptions.includeSensors ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="notifications-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Notificaciones
              </Text>
              <Text style={styles.optionDescription}>
                Reglas de alerta e historial de notificaciones
              </Text>
            </View>
            <Switch
              value={exportOptions.includeNotifications}
              onValueChange={() => toggleOption('includeNotifications')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={exportOptions.includeNotifications ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="settings-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Configuraciones
              </Text>
              <Text style={styles.optionDescription}>
                Preferencias de tema y datos de usuario
              </Text>
            </View>
            <Switch
              value={exportOptions.includeSettings}
              onValueChange={() => toggleOption('includeSettings')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={exportOptions.includeSettings ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.optionItem, styles.optionItemLast]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>
                <Ionicons name="analytics-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
                {' '}Estadísticas
              </Text>
              <Text style={styles.optionDescription}>
                Resumen y métricas generales del sistema
              </Text>
            </View>
            <Switch
              value={exportOptions.includeStats}
              onValueChange={() => toggleOption('includeStats')}
              disabled={isExporting}
              trackColor={{ false: '#767577', true: isDark ? '#0A84FF' : '#007AFF' }}
              thumbColor={exportOptions.includeStats ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Vista previa */}
        {previewData && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>
              <Ionicons name="eye-outline" size={16} color={colors.text} />
              {' '}Vista Previa
            </Text>
            <Text style={styles.previewText}>
              • {previewData.sensors.length} registros de sensores{'\n'}
              • {previewData.notifications.rules.length} reglas de notificación{'\n'}
              • {previewData.notifications.history.length} notificaciones{'\n'}
              • Temperatura promedio: {previewData.stats.avgTemperature}°C{'\n'}
              • Humedad promedio: {previewData.stats.avgHumidity}%
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <LiquidGlassButton
          title="Vista Previa"
          onPress={handlePreview}
          variant="secondary"
          disabled={isExporting}
          icon="eye-outline"
          style={styles.footerButton}
        />
        <View style={styles.footerRow}>
          <LiquidGlassButton
            title="Cancelar"
            onPress={onClose}
            variant="secondary"
            disabled={isExporting}
            style={styles.footerButton}
          />
          <LiquidGlassButton
            title={isExporting ? 'Exportando...' : 'Exportar'}
            onPress={handleExport}
            variant="primary"
            icon="cloud-upload-outline"
            disabled={isExporting}
            style={styles.footerButton}
          />
        </View>
      </View>

      {/* Date Range Selector Modal */}
      <CustomDateRangeSelector
        visible={showDateSelector}
        onClose={() => setShowDateSelector(false)}
        onSelectRange={handleDateRangeSelect}
      />
    </LiquidGlassModal>
  );
}
