import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProtectedRoute } from '../../components/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { sensorApi, SensorData } from '../../services/sensorApi';

interface SensorInfo {
  sensorId: string;
  nombre: string;
  ubicacion: string;
  tipo: string;
  modelo?: string;
  ultimaLectura?: SensorData;
  estado: 'activo' | 'inactivo' | 'error';
  totalLecturas: number;
}

export default function SensorsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { contentPaddingBottom } = useTabBarHeight();
  
  const [sensors, setSensors] = useState<SensorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState('');

  // Animación de puntos para el loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSensors = async () => {
    try {
      setLoading(true);
      console.log('Loading sensors...');
      
      // Obtener datos de sensores
      const sensorData = await sensorApi.getAllSensors();
      
      // Agrupar por sensorId para crear lista de sensores únicos
      const sensorMap = new Map<string, SensorInfo>();
      
      sensorData.forEach((data: any) => {
        const sensorId = data.sensorId || 'UNKNOWN';
        const existingSensor = sensorMap.get(sensorId);
        
        if (existingSensor) {
          // Actualizar con la lectura más reciente
          if (!existingSensor.ultimaLectura || 
              new Date(data.fecha) > new Date(existingSensor.ultimaLectura.fecha)) {
            existingSensor.ultimaLectura = data;
          }
          existingSensor.totalLecturas++;
        } else {
          // Crear nuevo sensor
          sensorMap.set(sensorId, {
            sensorId: sensorId,
            nombre: data.nombre || `Sensor ${sensorId}`,
            ubicacion: data.ubicacion || 'Ubicación no especificada',
            tipo: data.tipo || 'temperatura', // Campo "tipo" del ESP32
            modelo: data.modelo || 'DHT22', // Campo "modelo" del ESP32
            ultimaLectura: data,
            estado: 'activo',
            totalLecturas: 1
          });
        }
      });
      
      setSensors(Array.from(sensorMap.values()));
      console.log(`   Loaded ${sensors.length} sensors`);
    } catch (error) {
      console.error('  Error loading sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSensors();
    setRefreshing(false);
  };


  const getSensorIcon = (tipo: string) => {
    switch (tipo) {
      case 'temperatura':
        return 'thermometer-outline';
      case 'humedad':
        return 'water-outline';
      default:
        return 'hardware-chip-outline';
    }
  };


  useEffect(() => {
    loadSensors();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    header: {
      padding: 16,
      paddingTop: 50,
      backgroundColor: 'transparent',
    },
    headerGlass: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      // Sin sombras para que se vea igual al botón
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      letterSpacing: -0.2,
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
    },
    sectionContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 16,
    },
    sensorItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    sensorItemLast: {
      borderBottomWidth: 0,
    },
    sensorIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    sensorInfo: {
      flex: 1,
    },
    sensorName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
    },
    sensorLocation: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    sensorType: {
      fontSize: 13,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 4,
      fontWeight: '500',
    },
    sensorStatus: {
      fontSize: 12,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      marginTop: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateIcon: {
      fontSize: 48,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Dispositivos IoT conectados
            </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Obteniendo registro{loadingDots}</Text>
        </View>
      </View>
    );
  }

  const totalReadings = sensors.reduce((sum, s) => sum + s.totalLecturas, 0);

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BlurView
            intensity={isDark ? 20 : 0}
            tint={isDark ? 'dark' : 'light'}
            style={styles.headerGlass}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="hardware-chip-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </View>
              <Text style={styles.headerTitle}>Dispositivos IoT conectados</Text>
            </View>
          </BlurView>
        </View>

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{sensors.length}</Text>
              <Text style={styles.statLabel}>Total Sensores</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalReadings}</Text>
              <Text style={styles.statLabel}>Lecturas</Text>
            </View>
          </View>


          {/* Sensors List */}
          <BlurView
            intensity={isDark ? 20 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="hardware-chip-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                {' '}Mis Sensores ({sensors.length})
              </Text>
              
              {sensors.length > 0 ? (
                sensors.map((sensor, index) => (
                  <View 
                    key={sensor.sensorId} 
                    style={[
                      styles.sensorItem,
                      index === sensors.length - 1 && styles.sensorItemLast
                    ]}
                  >
                    <View style={styles.sensorIcon}>
                      <Ionicons 
                        name={getSensorIcon(sensor.tipo) as any} 
                        size={24} 
                        color={isDark ? '#FFFFFF' : '#000000'} 
                      />
                    </View>
                    
                    <View style={styles.sensorInfo}>
                      <Text style={styles.sensorName}>{sensor.nombre}</Text>
                      <Text style={styles.sensorLocation}>
                        <Ionicons name="location-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} /> {sensor.ubicacion}
                      </Text>
                      <Text style={styles.sensorType}>
                        <Ionicons name="hardware-chip-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} /> Tipo: {sensor.tipo} • Modelo: {sensor.modelo}
                      </Text>
                      <Text style={[styles.sensorStatus, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {sensor.totalLecturas} lecturas
                      </Text>
                      {sensor.ultimaLectura && (
                        <Text style={styles.sensorLocation}>
                          <Ionicons name="thermometer-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} /> {sensor.ultimaLectura.temperatura}°C • <Ionicons name="water-outline" size={12} color={isDark ? '#FFFFFF' : '#000000'} /> {sensor.ultimaLectura.humedad}%
                        </Text>
                      )}
                    </View>
                    
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="hardware-chip-outline" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
                  <Text style={styles.emptyStateText}>No hay sensores registrados</Text>
                </View>
              )}
            </View>
          </BlurView>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
