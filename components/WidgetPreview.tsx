import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmallWidget, MediumWidget, LargeWidget, useWidgetData } from '../widgets';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/Colors';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

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
