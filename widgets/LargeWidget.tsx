import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetData } from '../services/widgetService';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

interface LargeWidgetProps {
  data: WidgetData;
  onPress?: () => void;
  onRefresh?: () => void;
  onViewApp?: () => void;
}

export const LargeWidget: React.FC<LargeWidgetProps> = ({ 
  data, 
  onPress, 
  onRefresh, 
  onViewApp 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="analytics-outline" size={isSmallScreen ? 18 : 20} color="#FFFFFF" />
          <Text style={styles.title}>Dashboard IoT</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 16 : 18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Ionicons name={data.statusIcon as any} size={isSmallScreen ? 20 : 24} color={data.statusColor} />
          <Text style={[styles.status, { color: data.statusColor }]}>{data.status}</Text>
        </View>
        
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Ionicons name="thermometer-outline" size={isSmallScreen ? 20 : 24} color="#FF6B6B" />
            <Text style={styles.dataLabel}>Temperatura</Text>
            <Text style={styles.dataValue}>{data.temperature}</Text>
          </View>
          
          <View style={styles.dataItem}>
            <Ionicons name="water-outline" size={isSmallScreen ? 20 : 24} color="#4ECDC4" />
            <Text style={styles.dataLabel}>Humedad</Text>
            <Text style={styles.dataValue}>{data.humidity}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.locationSection}>
        <Ionicons name="location-outline" size={isSmallScreen ? 14 : 16} color="#FFFFFF" />
        <Text style={styles.location}>{data.location}</Text>
      </View>
      
      <View style={styles.actuatorSection}>
        <Ionicons name="settings-outline" size={isSmallScreen ? 14 : 16} color="#4ECDC4" />
        <Text style={styles.actuatorLabel}>Actuador:</Text>
        <Text style={styles.actuator}>{data.actuator}</Text>
      </View>
      
      {data.alerts > 0 && (
        <View style={styles.alertsSection}>
          <Ionicons name="warning-outline" size={isSmallScreen ? 14 : 16} color="#FFD43B" />
          <Text style={styles.alertsText}>{data.alerts} Alertas Activas</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.lastUpdateContainer}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 10 : 11} color="#888888" />
          <Text style={styles.lastUpdate}>Última actualización: {data.lastUpdate}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 12 : 14} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={onViewApp}>
          <Ionicons name="open-outline" size={isSmallScreen ? 12 : 14} color="#FFFFFF" />
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Ver App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: isSmallScreen ? 16 : 20,
    borderRadius: isSmallScreen ? 8 : 12,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  refreshButton: {
    padding: isSmallScreen ? 4 : 6,
  },
  statusSection: {
    marginBottom: isSmallScreen ? 12 : 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
  },
  status: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginLeft: 6,
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    color: '#888888',
    fontSize: isSmallScreen ? 10 : 11,
    marginBottom: isSmallScreen ? 3 : 4,
    marginTop: isSmallScreen ? 4 : 6,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    backgroundColor: '#2a2a2a',
    borderRadius: isSmallScreen ? 6 : 8,
  },
  location: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: isSmallScreen ? 6 : 8,
  },
  actuatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    backgroundColor: '#2a2a2a',
    borderRadius: isSmallScreen ? 6 : 8,
  },
  actuatorLabel: {
    color: '#888888',
    fontSize: isSmallScreen ? 11 : 12,
    marginLeft: isSmallScreen ? 6 : 8,
    marginRight: isSmallScreen ? 6 : 8,
  },
  actuator: {
    color: '#4ECDC4',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  alertsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    backgroundColor: '#FFD43B20',
    borderRadius: isSmallScreen ? 6 : 8,
    borderWidth: 1,
    borderColor: '#FFD43B40',
  },
  alertsText: {
    color: '#FFD43B',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    marginLeft: isSmallScreen ? 6 : 8,
  },
  footer: {
    marginBottom: isSmallScreen ? 12 : 16,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastUpdate: {
    color: '#888888',
    fontSize: isSmallScreen ? 10 : 11,
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: isSmallScreen ? 8 : 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: isSmallScreen ? 8 : 10,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    backgroundColor: '#333333',
    borderRadius: isSmallScreen ? 6 : 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
