import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetData } from '../services/widgetService';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

interface SmallWidgetProps {
  data: WidgetData;
  onPress?: () => void;
  onRefresh?: () => void;
}

export const SmallWidget: React.FC<SmallWidgetProps> = ({ data, onPress, onRefresh }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Ionicons name={data.statusIcon as any} size={isSmallScreen ? 14 : 16} color={data.statusColor} />
        <Text style={[styles.status, { color: data.statusColor }]}>{data.status}</Text>
      </View>
      
      <View style={styles.dataRow}>
        <Ionicons name="thermometer-outline" size={isSmallScreen ? 12 : 14} color="#FF6B6B" />
        <Text style={styles.temperature}>{data.temperature}</Text>
      </View>
      
      <View style={styles.dataRow}>
        <Ionicons name="water-outline" size={isSmallScreen ? 12 : 14} color="#4ECDC4" />
        <Text style={styles.humidity}>{data.humidity}</Text>
      </View>
      
      <Text style={styles.location} numberOfLines={1}>{data.location}</Text>
      
      <View style={styles.footer}>
        <View style={styles.lastUpdateContainer}>
          <Ionicons name="refresh-outline" size={isSmallScreen ? 8 : 9} color="#888888" />
          <Text style={styles.lastUpdate}>{data.lastUpdate}</Text>
        </View>
        {data.alerts > 0 && (
          <View style={styles.alertsContainer}>
            <Ionicons name="warning-outline" size={isSmallScreen ? 8 : 9} color="#FFD43B" />
            <Text style={styles.alerts}>{data.alerts}</Text>
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
    padding: isSmallScreen ? 8 : 12,
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
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  status: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 4,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 3 : 4,
  },
  temperature: {
    color: '#FF6B6B',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    marginLeft: isSmallScreen ? 6 : 8,
  },
  humidity: {
    color: '#4ECDC4',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    marginLeft: isSmallScreen ? 6 : 8,
  },
  location: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 10 : 11,
    marginTop: isSmallScreen ? 3 : 4,
    marginBottom: isSmallScreen ? 4 : 6,
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
    fontSize: isSmallScreen ? 8 : 9,
    marginLeft: 2,
  },
  alertsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alerts: {
    color: '#FFD43B',
    fontSize: isSmallScreen ? 8 : 9,
    fontWeight: '600',
    marginLeft: 2,
  },
});
