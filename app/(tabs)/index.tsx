import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import ScrollableChart from '../../components/ScrollableChart';
import LiquidGlassCard from '../../components/ui/LiquidGlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { sensorApi, SensorData, SensorStats } from '../../services/sensorApi';
import { userPreferencesApi } from '../../services/userPreferencesApi';

const screenWidth = Dimensions.get('window').width;

export default function InicioScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [stats, setStats] = useState<SensorStats>({
    totalReadings: 0,
    avgTemperature: 0,
    avgHumidity: 0,
    statusDistribution: {},
    actuatorDistribution: {},
  });
  const [chartData, setChartData] = useState<Array<{ fecha: string; temperatura: number; humedad: number }>>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ fecha: string; temperatura: number; humedad: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latestSensor, setLatestSensor] = useState<SensorData | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [uniqueSensors, setUniqueSensors] = useState<SensorData[]>([]);
  const [showSensorModal, setShowSensorModal] = useState(false);

  const loadPreferredLocationAndSetSensor = async (uniqueSensorsArray: SensorData[], latest: SensorData | null) => {
    try {
      if (!user?.id || !user?.token) return;
      
      // Load preferred location from API
      const preferredLocation = await userPreferencesApi.getPreferredLocation(user.id, user.token);
      
      if (preferredLocation) {
        // Find sensor with preferred location
        const preferredSensor = uniqueSensorsArray.find(sensor => sensor.ubicacion === preferredLocation);
        if (preferredSensor) {
          setSelectedSensor(preferredSensor);
          console.log(`Using preferred location: ${preferredLocation}`);
          return;
        }
      }
      
      // Fallback to default logic if no preferred location or sensor not found
      if (latest && !selectedSensor) {
        setSelectedSensor(latest);
      } else if (uniqueSensorsArray.length > 0 && !selectedSensor) {
        setSelectedSensor(uniqueSensorsArray[0]);
      }
    } catch (error) {
      console.error('Error loading preferred location:', error);
      // Fallback to default logic
      if (latest && !selectedSensor) {
        setSelectedSensor(latest);
      } else if (uniqueSensorsArray.length > 0 && !selectedSensor) {
        setSelectedSensor(uniqueSensorsArray[0]);
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Load all sensor data
      const allSensors = await sensorApi.getAllSensors();
      setSensorData(allSensors);
      
      // Calculate stats based on selected time range
      const calculatedStats = sensorApi.calculateStats(allSensors);
      setStats(calculatedStats);
      
      // Get latest sensor
      const latest = await sensorApi.getLatestSensor();
      setLatestSensor(latest);
      
      // Extract unique sensors by sensorId
      const uniqueSensorMap = new Map<string, SensorData>();
      allSensors.forEach(sensor => {
        if (sensor.sensorId && !uniqueSensorMap.has(sensor.sensorId)) {
          uniqueSensorMap.set(sensor.sensorId, sensor);
        }
      });
      const uniqueSensorsArray = Array.from(uniqueSensorMap.values());
      setUniqueSensors(uniqueSensorsArray);
      
      // Load preferred location and set selected sensor
      await loadPreferredLocationAndSetSensor(uniqueSensorsArray, latest);
      
      // Check notifications for latest sensor data
      if (latest) {
        notificationService.checkSensorData(latest);
      }
      
      // Get chart data based on selected time range - Only last hours for dashboard
      let chart = await sensorApi.getLastHoursData();
      let weekly = await sensorApi.getLastHoursData();
      
      setChartData(chart);
      setWeeklyData(weekly);
      
      console.log('Inicio data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedSensorData = async (sensor: SensorData) => {
    try {
      console.log('Loading data for sensor:', sensor.sensorId);
      
      // Get data for specific sensor
      const sensorSpecificData = await sensorApi.getSensorsBySensorId(sensor.sensorId || '');
      
      // Calculate stats for this specific sensor
      const calculatedStats = sensorApi.calculateStats(sensorSpecificData);
      setStats(calculatedStats);
      
      // Get chart data for this specific sensor
      let chart = await sensorApi.getLastHoursDataBySensorId(sensor.sensorId || '');
      let weekly = await sensorApi.getLastHoursDataBySensorId(sensor.sensorId || '');
      
      setChartData(chart);
      setWeeklyData(weekly);
      
      // Check notifications for selected sensor data
      if (sensor) {
        await notificationService.checkSensorData(sensor);
      }
      
    } catch (error) {
      console.error('Error loading selected sensor data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSensor) {
      loadSelectedSensorData(selectedSensor);
    }
  }, [selectedSensor]);

  // Prepare chart data dynamically based on theme and data amount
  const getTemperatureData = () => {
    const data = chartData;
    const dataLength = data.length;
    
    // Determine how many labels to show based on data amount
    let labels: string[];
    let chartDataPoints: number[];
    
    if (dataLength <= 10) {
      // Show all data points for small datasets
      labels = data.map(item => {
        const date = new Date(item.fecha);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      chartDataPoints = data.map(item => item.temperatura);
    } else if (dataLength <= 24) {
      // Show every 2nd point for medium datasets
      const step = Math.ceil(dataLength / 12);
      labels = data.filter((_, index) => index % step === 0).map(item => {
        const date = new Date(item.fecha);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      chartDataPoints = data.filter((_, index) => index % step === 0).map(item => item.temperatura);
    } else {
      // Show every 4th point for large datasets
      const step = Math.ceil(dataLength / 8);
      labels = data.filter((_, index) => index % step === 0).map(item => {
        const date = new Date(item.fecha);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      chartDataPoints = data.filter((_, index) => index % step === 0).map(item => item.temperatura);
    }
    
    return {
      labels,
      datasets: [
        {
          data: chartDataPoints,
          color: (opacity = 1) => isDark ? `rgba(255, 69, 58, ${opacity})` : `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getHumidityData = () => {
    const data = weeklyData;
    const dataLength = data.length;
    
    // Determine how many labels to show based on data amount
    let labels: string[];
    let chartDataPoints: number[];
    
    if (dataLength <= 10) {
      // Show all data points for small datasets
      labels = data.map(item => {
        const date = new Date(item.fecha);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      chartDataPoints = data.map(item => item.humedad);
    } else if (dataLength <= 30) {
      // Show every 3rd point for medium datasets
      const step = Math.ceil(dataLength / 10);
      labels = data.filter((_, index) => index % step === 0).map(item => {
        const date = new Date(item.fecha);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      chartDataPoints = data.filter((_, index) => index % step === 0).map(item => item.humedad);
    } else {
      // Show every 5th point for large datasets
      const step = Math.ceil(dataLength / 8);
      labels = data.filter((_, index) => index % step === 0).map(item => {
        const date = new Date(item.fecha);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      chartDataPoints = data.filter((_, index) => index % step === 0).map(item => item.humedad);
    }
    
    return {
      labels,
      datasets: [
        {
          data: chartDataPoints,
          color: (opacity = 1) => isDark ? `rgba(0, 122, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

    const getChartConfig = () => {
    const tempDataLength = chartData.length;
    const humidityDataLength = weeklyData.length;
    
    // Determine decimal places based on data range
    const tempRange = Math.max(...chartData.map(d => d.temperatura)) - Math.min(...chartData.map(d => d.temperatura));
    const humidityRange = Math.max(...weeklyData.map(d => d.humedad)) - Math.min(...weeklyData.map(d => d.humedad));
    
    const tempDecimals = tempRange < 10 ? 1 : 0;
    const humidityDecimals = humidityRange < 10 ? 1 : 0;
    
    return {
      backgroundColor: isDark ? 'transparent' : '#FFFFFF',
      backgroundGradientFrom: isDark ? 'transparent' : '#FFFFFF',
      backgroundGradientTo: isDark ? 'transparent' : '#FFFFFF',
      decimalPlaces: Math.max(tempDecimals, humidityDecimals),
      color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(29, 29, 31, ${opacity})`,
      labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity * 0.8})` : `rgba(29, 29, 31, ${opacity * 0.8})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: tempDataLength <= 20 ? '4' : '3',
        strokeWidth: '2',
        stroke: isDark ? '#FFFFFF' : '#000000',
      },
      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(29, 29, 31, 0.1)',
        strokeWidth: 1,
      },
      // Adaptive spacing based on data amount
      propsForLabels: {
        fontSize: tempDataLength <= 15 ? 12 : 10,
      },
      // Mejorar la responsividad de las gráficas deslizables
      propsForHorizontalLabels: {
        fontSize: 10,
        rotation: 0,
      },
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return isDark ? '#FFFFFF' : '#000000';
      case 'frio': return isDark ? '#FFFFFF' : '#000000';
      case 'caliente': return isDark ? '#FFFFFF' : '#000000';
      case 'critico': return isDark ? '#FFFFFF' : '#000000';
      case 'bajo': return isDark ? '#FFFFFF' : '#000000';
      case 'alto': return isDark ? '#FFFFFF' : '#000000';
      default: return isDark ? '#FFFFFF' : '#000000';
    }
  };

  const getDataInfo = (dataLength: number) => {
    if (dataLength === 0) return 'Sin datos';
    if (dataLength === 1) return `${dataLength} lectura`;
    return `${dataLength} lecturas`;
  };

  const getChartHeight = (dataLength: number) => {
    // Altura optimizada para gráficas deslizables
    if (dataLength <= 5) return 180;
    if (dataLength <= 10) return 200;
    if (dataLength <= 20) return 220;
    if (dataLength <= 40) return 240;
    return 260;
  };


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      padding: 16,
      paddingTop: 10,
      backgroundColor: 'transparent',
    },
    headerGlass: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
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
    sensorSelectorButton: {
      position: 'absolute',
      bottom: 8,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      gap: 6,
    },
    sensorSelectorText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '60%',
      minHeight: '40%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    modalCloseButton: {
      padding: 4,
    },
    sensorOption: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    selectedSensorOption: {
      backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
    },
    sensorOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sensorOptionInfo: {
      flex: 1,
      marginLeft: 12,
    },
    sensorOptionLocation: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    sensorOptionId: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginTop: 2,
    },
    headerSubtitle: {
      fontSize: 17,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '400',
    },
    scrollContent: {
      padding: 20,
    },
    statsContainer: {
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      marginHorizontal: 5,
      // Los estilos de Liquid Glass se manejan en el componente base
    },
    fullWidthCard: {
      flex: 1,
      marginHorizontal: 5,
    },
    statContent: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      // Subtle border
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 2,
    },
    statSubtitle: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '400',
      textAlign: 'center',
      opacity: 0.8,
    },
    // Specific card styles - ahora manejados por LiquidGlassCard
    temperatureCard: {
      // Estilos específicos si los necesitas
    },
    humidityCard: {
      // Estilos específicos si los necesitas
    },
    actuatorCard: {
      // Estilos específicos si los necesitas
    },
    // Icon container styles - removed to avoid black squares
    chartContainer: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 20,
      // Liquid Glass effect 100% Apple
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      // Shadow for depth - Liquid Glass
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
      // Backdrop blur effect
      backdropFilter: 'blur(20px)',
      // Optimizado para gráficas deslizables
      minHeight: 200,
    },
    chartContent: {
      padding: 20,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 16,
    },
    alertCard: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 10,
      // Liquid Glass effect 100% Apple
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      // Shadow for depth - Liquid Glass
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
      // Backdrop blur effect
      backdropFilter: 'blur(20px)',
    },
    alertContent: {
      padding: 20,
    },
        alertTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginLeft: 8,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    alertMessage: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      lineHeight: 20,
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
});

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            Bienvenido, {user?.username || 'Cargando...'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando datos en tiempo real...</Text>
        </View>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlass}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="home-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <Text style={styles.headerTitle}>
              Bienvenido, {user?.username || 'Cargando...'}
            </Text>
          </View>
          {selectedSensor && uniqueSensors.length > 1 && (
            <TouchableOpacity
              style={styles.sensorSelectorButton}
              onPress={() => setShowSensorModal(true)}
            >
              <Ionicons name="hardware-chip-outline" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={styles.sensorSelectorText}>{selectedSensor.sensorId}</Text>
              <Ionicons name="chevron-down-outline" size={14} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* First Row - Temperature and Humidity */}
          <View style={styles.statsRow}>
            <LiquidGlassCard style={[styles.statCard, styles.temperatureCard]}>
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons 
                    name="thermometer" 
                    size={32} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                </View>
                <Text style={styles.statValue}>
                  {selectedSensor ? `${selectedSensor.temperatura}°C` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Temperatura</Text>
                <Text style={styles.statSubtitle}>{selectedSensor ? selectedSensor.sensorId : 'Actual'}</Text>
              </View>
            </LiquidGlassCard>

            <LiquidGlassCard style={[styles.statCard, styles.humidityCard]}>
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons 
                    name="water" 
                    size={32} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                </View>
                <Text style={styles.statValue}>
                  {selectedSensor ? `${selectedSensor.humedad}%` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Humedad</Text>
                <Text style={styles.statSubtitle}>{selectedSensor ? selectedSensor.sensorId : 'Actual'}</Text>
              </View>
            </LiquidGlassCard>
          </View>

          {/* Second Row - Actuator (Full Width) */}
          <View style={styles.statsRow}>
            <LiquidGlassCard style={[styles.statCard, styles.actuatorCard, styles.fullWidthCard]}>
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons 
                    name="settings" 
                    size={32} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                </View>
                <Text style={styles.statValue}>
                  {selectedSensor?.actuador || latestSensor?.actuador || 'Ninguno'}
                </Text>
                <Text style={styles.statLabel}>Actuador</Text>
                <Text style={styles.statSubtitle}>{selectedSensor ? selectedSensor.sensorId : 'Estado'}</Text>
              </View>
            </LiquidGlassCard>
          </View>
        </View>

        {/* Temperature Chart */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.chartContainer}
        >
          <View style={styles.chartContent}>
            <Text style={styles.chartTitle}>
              Temperatura (Últimas 6 horas) - {selectedSensor ? selectedSensor.sensorId : 'Todos'} - {getDataInfo(chartData.length)}
            </Text>
            {getTemperatureData().datasets[0].data.length > 0 ? (
              <ScrollableChart 
                dataLength={chartData.length}
                maxVisiblePoints={8}
                chartWidth={Math.max(screenWidth - 80, Math.max(chartData.length * 50, (screenWidth - 80) * 1.2))}
              >
                <LineChart
                  key={`temp-${isDark ? 'dark' : 'light'}`}
                  data={getTemperatureData()}
                  width={Math.max(screenWidth - 80, Math.max(chartData.length * 50, (screenWidth - 80) * 1.2))}
                  height={getChartHeight(chartData.length)}
                  chartConfig={getChartConfig()}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </ScrollableChart>
            ) : (
              <Text style={styles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </BlurView>

        {/* Humidity Chart */}
        <BlurView
          intensity={isDark ? 20 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.chartContainer}
        >
          <View style={styles.chartContent}>
            <Text style={styles.chartTitle}>
              Humedad (Últimas 6 horas) - {selectedSensor ? selectedSensor.sensorId : 'Todos'} - {getDataInfo(weeklyData.length)}
            </Text>
            {getHumidityData().datasets[0].data.length > 0 ? (
              <ScrollableChart 
                dataLength={weeklyData.length}
                maxVisiblePoints={8}
                chartWidth={Math.max(screenWidth - 80, Math.max(weeklyData.length * 50, (screenWidth - 80) * 1.2))}
              >
                <BarChart
                  key={`humidity-${isDark ? 'dark' : 'light'}`}
                  data={getHumidityData()}
                  width={Math.max(screenWidth - 80, Math.max(weeklyData.length * 50, (screenWidth - 80) * 1.2))}
                  height={getChartHeight(weeklyData.length)}
                  chartConfig={getChartConfig()}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </ScrollableChart>
            ) : (
              <Text style={styles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </BlurView>

        {/* Alerts */}
        {selectedSensor && selectedSensor.estado === 'caliente' && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="flame" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Estado Caliente</Text>
              </View>
              <Text style={styles.alertMessage}>
                El sensor está en estado caliente. Temperatura: {selectedSensor.temperatura}°C, Humedad: {selectedSensor.humedad}%
              </Text>
            </View>
          </View>
        )}

        {selectedSensor && selectedSensor.estado === 'frio' && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="snow" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Estado Frío</Text>
              </View>
              <Text style={styles.alertMessage}>
                El sensor está en estado frío. Temperatura: {selectedSensor.temperatura}°C, Humedad: {selectedSensor.humedad}%
              </Text>
            </View>
          </View>
        )}

        {selectedSensor && selectedSensor.temperatura > 40 && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Temperatura Muy Alta</Text>
              </View>
              <Text style={styles.alertMessage}>
                La temperatura ha superado los 40°C. Activar ventilación inmediatamente.
              </Text>
            </View>
          </View>
        )}

        {selectedSensor && selectedSensor.temperatura < 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="thermometer" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Temperatura Muy Baja</Text>
              </View>
              <Text style={styles.alertMessage}>
                La temperatura está por debajo de 0°C. Activar calefacción.
              </Text>
            </View>
          </View>
        )}

        {selectedSensor && selectedSensor.humedad > 80 && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="water" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Humedad Alta</Text>
              </View>
              <Text style={styles.alertMessage}>
                La humedad ha superado el 80%. Verificar sistema de deshumidificación.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sensor Selection Modal */}
      <Modal
        visible={showSensorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSensorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowSensorModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Sensor</Text>
              <TouchableOpacity 
                onPress={() => setShowSensorModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={uniqueSensors}
              keyExtractor={(item) => item.sensorId || item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sensorOption,
                    selectedSensor?.sensorId === item.sensorId && styles.selectedSensorOption
                  ]}
                  onPress={() => {
                    setSelectedSensor(item);
                    setShowSensorModal(false);
                  }}
                >
                  <View style={styles.sensorOptionContent}>
                    <Ionicons 
                      name="location-outline" 
                      size={20} 
                      color={isDark ? '#FFFFFF' : '#000000'} 
                    />
                    <View style={styles.sensorOptionInfo}>
                      <Text style={styles.sensorOptionLocation}>{item.ubicacion}</Text>
                      <Text style={styles.sensorOptionId}>ID: {item.sensorId}</Text>
                    </View>
                    {selectedSensor?.sensorId === item.sensorId && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color="#007AFF" 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
      </View>
    </ProtectedRoute>
  );
}
