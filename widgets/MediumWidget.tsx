import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetData } from '../services/widgetService';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

interface MediumWidgetProps {
  data: WidgetData;
  onPress?: () => void;
  onRefresh?: () => void;
}

export const MediumWidget: React.FC<MediumWidgetProps> = ({ data, onPress, onRefresh }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="analytics-outline" size={isSmallScreen ? 16 : 18} color="#FFFFFF" />
          <Text style={styles.title}>Estado del Sistema</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 14 : 16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dataGrid}>
        <View style={styles.dataItem}>
          <Ionicons name="thermometer-outline" size={isSmallScreen ? 18 : 20} color="#FF6B6B" />
          <Text style={styles.dataValue}>{data.temperature}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name="water-outline" size={isSmallScreen ? 18 : 20} color="#4ECDC4" />
          <Text style={styles.dataValue}>{data.humidity}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name={data.statusIcon as any} size={isSmallScreen ? 18 : 20} color={data.statusColor} />
          <Text style={[styles.dataValue, { color: data.statusColor }]}>{data.status}</Text>
        </View>
      </View>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={isSmallScreen ? 12 : 14} color="#FFFFFF" />
        <Text style={styles.location} numberOfLines={1}>{data.location}</Text>
      </View>
      
      <View style={styles.actuatorRow}>
        <Ionicons name="settings-outline" size={isSmallScreen ? 12 : 14} color="#4ECDC4" />
        <Text style={styles.actuator}>{data.actuator}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.lastUpdateContainer}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 8 : 10} color="#888888" />
          <Text style={styles.lastUpdate}>{data.lastUpdate}</Text>
        </View>
        {data.alerts > 0 && (
          <View style={styles.alertsContainer}>
            <Ionicons name="warning-outline" size={isSmallScreen ? 8 : 10} color="#FFD43B" />
            <Text style={styles.alerts}>{data.alerts} alertas</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: isSmallScreen ? 12 : 16,
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
    marginBottom: isSmallScreen ? 10 : 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  refreshButton: {
    padding: isSmallScreen ? 2 : 4,
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 10 : 12,
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: isSmallScreen ? 2 : 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  location: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 11 : 12,
    flex: 1,
    marginLeft: isSmallScreen ? 6 : 8,
  },
  actuatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
  },
  actuator: {
    color: '#4ECDC4',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginLeft: isSmallScreen ? 6 : 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdate: {
    color: '#888888',
    fontSize: isSmallScreen ? 8 : 10,
    marginLeft: 2,
  },
  alertsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alerts: {
    color: '#FFD43B',
    fontSize: isSmallScreen ? 8 : 10,
    fontWeight: '600',
    marginLeft: 2,
  },
});
