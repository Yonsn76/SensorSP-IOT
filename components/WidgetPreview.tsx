import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { LargeWidget, MediumWidget, SmallWidget, useWidgetData } from '../widgets';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

// Check if native widgets are available (Android only)
const isNativeWidgetsAvailable = Platform.OS === 'android';

export const WidgetPreview: React.FC = () => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { widgetData, isLoading, error, refreshWidgetData } = useWidgetData();

  const handleWidgetPress = () => {
    Alert.alert('Widget Tocado', 'Esto abriría la app en la sección correspondiente');
  };

  const handleRefresh = () => {
    refreshWidgetData();
  };

  const handleViewApp = () => {
    Alert.alert('Ver App', 'Esto abriría la app completa');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando datos del widget...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!widgetData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.noDataText, { color: colors.text }]}>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Vista Previa de Widgets</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Estos son los widgets que aparecerían en tu pantalla de inicio
        </Text>

      {/* Native Widget Instructions Section */}
      {isNativeWidgetsAvailable && (
        <View style={[styles.nativeWidgetSection, { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.nativeWidgetHeader}>
            <Ionicons name="apps" size={24} color="#007AFF" />
            <Text style={[styles.nativeWidgetTitle, { color: colors.text }]}>
              Widgets Nativos de Android
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: '#34C759' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.statusBadgeText}>Disponibles</Text>
          </View>

          <Text style={[styles.nativeWidgetDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Los widgets nativos de SensorSP están disponibles para añadir a tu pantalla de inicio.
          </Text>

          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Cómo añadir un widget:
            </Text>
            <View style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: '#007AFF' }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.instructionText, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Mantén presionada la pantalla de inicio
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: '#007AFF' }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.instructionText, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Selecciona "Widgets" en el menú
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: '#007AFF' }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.instructionText, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Busca "SensorSP" en la lista
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: '#007AFF' }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={[styles.instructionText, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Arrastra el widget deseado a tu pantalla
              </Text>
            </View>
          </View>

          <View style={styles.widgetSizesInfo}>
            <Text style={[styles.widgetSizesTitle, { color: colors.text }]}>
              Tamaños disponibles:
            </Text>
            <View style={styles.widgetSizeRow}>
              <View style={[styles.widgetSizeIcon, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]}>
                <Text style={styles.widgetSizeIconText}>2×2</Text>
              </View>
              <Text style={[styles.widgetSizeLabel, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Pequeño - Temperatura y humedad básica
              </Text>
            </View>
            <View style={styles.widgetSizeRow}>
              <View style={[styles.widgetSizeIcon, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]}>
                <Text style={styles.widgetSizeIconText}>4×2</Text>
              </View>
              <Text style={[styles.widgetSizeLabel, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Mediano - Con última actualización y alertas
              </Text>
            </View>
            <View style={styles.widgetSizeRow}>
              <View style={[styles.widgetSizeIcon, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]}>
                <Text style={styles.widgetSizeIconText}>4×4</Text>
              </View>
              <Text style={[styles.widgetSizeLabel, { color: isDark ? '#CCCCCC' : '#333333' }]}>
                Grande - Dashboard completo con acciones
              </Text>
            </View>
          </View>
        </View>
      )}

      {!isNativeWidgetsAvailable && (
        <View style={[styles.nativeWidgetSection, { backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.nativeWidgetHeader}>
            <Ionicons name="information-circle" size={24} color="#FF9500" />
            <Text style={[styles.nativeWidgetTitle, { color: colors.text }]}>
              Widgets Nativos
            </Text>
          </View>
          <Text style={[styles.nativeWidgetDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Los widgets nativos solo están disponibles en dispositivos Android. 
            En iOS, puedes ver la vista previa de los widgets a continuación.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Widget Pequeño (2x2)</Text>
        <View style={styles.smallWidgetContainer}>
          <SmallWidget 
            data={widgetData} 
            onPress={handleWidgetPress}
            onRefresh={handleRefresh}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Widget Mediano (4x2)</Text>
        <View style={styles.mediumWidgetContainer}>
          <MediumWidget 
            data={widgetData} 
            onPress={handleWidgetPress}
            onRefresh={handleRefresh}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Widget Grande (4x4)</Text>
        <View style={styles.largeWidgetContainer}>
          <LargeWidget 
            data={widgetData} 
            onPress={handleWidgetPress}
            onRefresh={handleRefresh}
            onViewApp={handleViewApp}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 16 : 18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Actualizar Datos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Ionicons name="bulb-outline" size={isSmallScreen ? 14 : 16} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Los widgets se actualizan automáticamente cada 5 minutos
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="phone-portrait-outline" size={isSmallScreen ? 14 : 16} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Toca un widget para abrir la app en la sección correspondiente
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 14 : 16} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <Text style={[styles.infoText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Usa el botón de actualizar para obtener datos frescos
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isSmallScreen ? 12 : 16,
  },
  title: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '700',
    marginBottom: isSmallScreen ? 6 : 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallScreen ? 12 : 14,
    textAlign: 'center',
    marginBottom: isSmallScreen ? 20 : 24,
  },
  // Native Widget Section Styles
  nativeWidgetSection: {
    padding: isSmallScreen ? 12 : 16,
    borderRadius: isSmallScreen ? 10 : 12,
    marginBottom: isSmallScreen ? 20 : 24,
  },
  nativeWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 8 : 12,
  },
  nativeWidgetTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: isSmallScreen ? 8 : 10,
    paddingVertical: isSmallScreen ? 4 : 6,
    borderRadius: isSmallScreen ? 12 : 14,
    marginBottom: isSmallScreen ? 10 : 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  nativeWidgetDescription: {
    fontSize: isSmallScreen ? 12 : 14,
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: isSmallScreen ? 12 : 16,
  },
  instructionsContainer: {
    marginBottom: isSmallScreen ? 12 : 16,
  },
  instructionsTitle: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '600',
    marginBottom: isSmallScreen ? 8 : 10,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  stepNumber: {
    width: isSmallScreen ? 20 : 24,
    height: isSmallScreen ? 20 : 24,
    borderRadius: isSmallScreen ? 10 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 8 : 10,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: isSmallScreen ? 12 : 13,
    flex: 1,
  },
  widgetSizesInfo: {
    marginTop: isSmallScreen ? 4 : 8,
  },
  widgetSizesTitle: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '600',
    marginBottom: isSmallScreen ? 8 : 10,
  },
  widgetSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  widgetSizeIcon: {
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 3 : 4,
    borderRadius: isSmallScreen ? 4 : 6,
    marginRight: isSmallScreen ? 8 : 10,
  },
  widgetSizeIconText: {
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '600',
    color: '#007AFF',
  },
  widgetSizeLabel: {
    fontSize: isSmallScreen ? 12 : 13,
    flex: 1,
  },
  section: {
    marginBottom: isSmallScreen ? 24 : 32,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    marginBottom: isSmallScreen ? 10 : 12,
  },
  smallWidgetContainer: {
    width: isSmallScreen ? 120 : 150,
    height: isSmallScreen ? 120 : 150,
    alignSelf: 'center',
  },
  mediumWidgetContainer: {
    width: isSmallScreen ? 240 : 300,
    height: isSmallScreen ? 120 : 150,
    alignSelf: 'center',
  },
  largeWidgetContainer: {
    width: isSmallScreen ? 240 : 300,
    height: isSmallScreen ? 240 : 300,
    alignSelf: 'center',
  },
  actions: {
    marginVertical: isSmallScreen ? 20 : 24,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: isSmallScreen ? 6 : 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  info: {
    marginTop: isSmallScreen ? 20 : 24,
    padding: isSmallScreen ? 12 : 16,
    backgroundColor: '#2a2a2a',
    borderRadius: isSmallScreen ? 6 : 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  infoText: {
    fontSize: isSmallScreen ? 11 : 12,
    lineHeight: isSmallScreen ? 14 : 16,
    marginLeft: 8,
    flex: 1,
  },
  loadingText: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#FF6B6B',
  },
  noDataText: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
    marginTop: 50,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: isSmallScreen ? 4 : 6,
    alignSelf: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
  },
});
