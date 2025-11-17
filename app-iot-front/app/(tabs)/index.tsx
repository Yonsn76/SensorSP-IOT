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
import { ProtectedRoute } from '../../components/auth';
import ScrollableChart from '../../components/ScrollableChart';
import { LiquidGlassCard } from '../../components/ui/cards';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Screen, StatCard, Card } from '../../components/ui';
import { useGlobalStyles } from '../../styles';
import { notificationService } from '../../services/notificationService';
import { sensorApi, SensorData, SensorStats } from '../../services/sensorApi';
import { userPreferencesApi } from '../../services/userPreferencesApi';

const screenWidth = Dimensions.get('window').width;

export default function InicioScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { responsiveSizes } = useResponsive();
  const globalStyles = useGlobalStyles();
  
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

  const loadPreferredSensorAndSetSensor = async (uniqueSensorsArray: SensorData[], latest: SensorData | null) => {
    try {
      if (!user?.id || !user?.token) return;

      // Load preferred sensor ID from API
      const preferredSensorId = await userPreferencesApi.getPreferredSensor(user.id, user.token);

      if (preferredSensorId) {
        // Find sensor with preferred sensor ID
        const preferredSensor = uniqueSensorsArray.find(sensor => sensor.sensorId === preferredSensorId);
        if (preferredSensor) {
          setSelectedSensor(preferredSensor);
          console.log(`Using preferred sensor: ${preferredSensorId}`);
          return;
        }
      }

      // Fallback to default logic if no preferred sensor or sensor not found
      if (latest && !selectedSensor) {
        setSelectedSensor(latest);
      } else if (uniqueSensorsArray.length > 0 && !selectedSensor) {
        setSelectedSensor(uniqueSensorsArray[0]);
      }
    } catch (error) {
      console.error('Error loading preferred sensor:', error);
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
      
      // Load preferred sensor and set selected sensor
      await loadPreferredSensorAndSetSensor(uniqueSensorsArray, latest);
      
      // Load user preferences
      if (user?.id && user?.token) {
        try {
          const userPreferences = await userPreferencesApi.getUserPreferences(user.id, user.token);
          if (userPreferences.success && userPreferences.data) {
            console.log('Preferencias del usuario cargadas');
          }
        } catch (error) {
          console.error('Error loading user preferences in inicio:', error);
        }
      }
      
      // Cargar notificaciones desde la base de datos y verificar alertas
      if (user?.id && user?.token) {
        await notificationService.loadNotificationsFromDatabase(user.id, user.token);
        
        // Check notifications for latest sensor data
        if (latest) {
          await notificationService.checkSensorData(latest);
        }
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
      
      // Cargar notificaciones y verificar alertas para el sensor seleccionado
      if (user?.id && user?.token) {
        await notificationService.loadNotificationsFromDatabase(user.id, user.token);
        
        if (sensor) {
          await notificationService.checkSensorData(sensor);
        }
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


  const getResponsiveCardStyles = () => {
    const screenWidth = Dimensions.get('window').width;
    const isSmallScreen = screenWidth < 375;
    const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
    
    return {
      statsRow: {
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: 12,
        gap: isSmallScreen ? 4 : isMediumScreen ? 6 : 8,
        paddingHorizontal: isSmallScreen ? 6 : isMediumScreen ? 8 : 10,
      },
      statCard: {
        flex: isSmallScreen ? 0.42 : isMediumScreen ? 0.40 : 0.38,
        minHeight: isSmallScreen ? 160 : isMediumScreen ? 170 : 180,
      },
      actuatorCard: {
        flex: isSmallScreen ? 0.60 : isMediumScreen ? 0.55 : 0.50,
        minHeight: isSmallScreen ? 100 : isMediumScreen ? 110 : 120,
      },
    };
  };

  const responsiveCardStyles = getResponsiveCardStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    // Header styles moved to useHeaderStyles hook
    // sensorSelectorButton moved to headerStyles
    // sensorSelectorText moved to headerStyles
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
      paddingHorizontal: 0,
    },
    statsRow: responsiveCardStyles.statsRow,
    statCard: responsiveCardStyles.statCard,
    fullWidthCard: responsiveCardStyles.actuatorCard,
    statContent: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 80,
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
    // Chart styles now use globalStyles.chartContainer, chartContent, chartTitle
    // Alert styles now use globalStyles.alertCard, alertContent, alertTitle, alertHeader, alertMessage
    // Loading styles now use globalStyles.loadingContainer, loadingText
});

  if (loading) {
    return (
      <Screen
        title="Bienvenido"
        subtitle={user?.username || 'Cargando...'}
        icon="home-outline"
        showBlur={false}
      >
        <View style={globalStyles.loadingContainer}>
          <Text style={globalStyles.loadingText}>Obteniendo registro{loadingDots}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <ProtectedRoute>
      <Screen
        title="Bienvenido"
        subtitle={user?.username || 'Cargando...'}
        icon="home-outline"
        rightButton={selectedSensor && uniqueSensors.length > 1 ? {
          icon: 'hardware-chip-outline',
          text: selectedSensor.sensorId || 'Sensor',
          onPress: () => setShowSensorModal(true)
        } : undefined}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* First Row - Temperature and Humidity */}
          <View style={styles.statsRow}>
            <StatCard
              title="Temperatura"
              value={selectedSensor ? `${selectedSensor.temperatura}°C` : 'N/A'}
              icon="thermometer"
              variant="highlighted"
              size={screenWidth < 375 ? "medium" : "large"}
              padding="small"
              style={responsiveCardStyles.statCard}
            />

            <StatCard
              title="Humedad"
              value={selectedSensor ? `${selectedSensor.humedad}%` : 'N/A'}
              icon="water"
              variant="highlighted"
              size={screenWidth < 375 ? "medium" : "large"}
              padding="small"
              style={responsiveCardStyles.statCard}
            />
          </View>

          {/* Second Row - Actuator (Full Width) */}
          <View style={styles.statsRow}>
            <LiquidGlassCard style={[styles.statCard, styles.actuatorCard, styles.fullWidthCard]}>
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons 
                    name="settings" 
                    size={24} 
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
          intensity={isDark ? 50 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={globalStyles.chartContainer}
        >
          <View style={globalStyles.chartContent}>
            <Text style={globalStyles.chartTitle}>
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
              <Text style={globalStyles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </BlurView>

        {/* Humidity Chart */}
        <BlurView
          intensity={isDark ? 50 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={globalStyles.chartContainer}
        >
          <View style={globalStyles.chartContent}>
            <Text style={globalStyles.chartTitle}>
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
              <Text style={globalStyles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </BlurView>

        {/* Alerts */}
        {selectedSensor && selectedSensor.estado === 'caliente' && (
          <BlurView
            intensity={isDark ? 50 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={globalStyles.alertCard}
          >
            <View style={globalStyles.alertContent}>
              <View style={globalStyles.alertHeader}>
                <Ionicons name="flame" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={globalStyles.alertTitle}>Estado Caliente</Text>
              </View>
              <Text style={globalStyles.alertMessage}>
                El sensor está en estado caliente. Temperatura: {selectedSensor.temperatura}°C, Humedad: {selectedSensor.humedad}%
              </Text>
            </View>
          </BlurView>
        )}

        {selectedSensor && selectedSensor.estado === 'frio' && (
          <BlurView
            intensity={isDark ? 50 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={globalStyles.alertCard}
          >
            <View style={globalStyles.alertContent}>
              <View style={globalStyles.alertHeader}>
                <Ionicons name="snow" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={globalStyles.alertTitle}>Estado Frío</Text>
              </View>
              <Text style={globalStyles.alertMessage}>
                El sensor está en estado frío. Temperatura: {selectedSensor.temperatura}°C, Humedad: {selectedSensor.humedad}%
              </Text>
            </View>
          </BlurView>
        )}

        {selectedSensor && selectedSensor.temperatura > 40 && (
          <BlurView
            intensity={isDark ? 50 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={globalStyles.alertCard}
          >
            <View style={globalStyles.alertContent}>
              <View style={globalStyles.alertHeader}>
                <Ionicons name="warning" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={globalStyles.alertTitle}>Temperatura Muy Alta</Text>
              </View>
              <Text style={globalStyles.alertMessage}>
                La temperatura ha superado los 40°C. Activar ventilación inmediatamente.
              </Text>
            </View>
          </BlurView>
        )}

        {selectedSensor && selectedSensor.temperatura < 0 && (
          <BlurView
            intensity={isDark ? 50 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={globalStyles.alertCard}
          >
            <View style={globalStyles.alertContent}>
              <View style={globalStyles.alertHeader}>
                <Ionicons name="thermometer" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={globalStyles.alertTitle}>Temperatura Muy Baja</Text>
              </View>
              <Text style={globalStyles.alertMessage}>
                La temperatura está por debajo de 0°C. Activar calefacción.
              </Text>
            </View>
          </BlurView>
        )}

        {selectedSensor && selectedSensor.humedad > 80 && (
          <BlurView
            intensity={isDark ? 50 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={globalStyles.alertCard}
          >
            <View style={globalStyles.alertContent}>
              <View style={globalStyles.alertHeader}>
                <Ionicons name="water" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={globalStyles.alertTitle}>Humedad Alta</Text>
              </View>
              <Text style={globalStyles.alertMessage}>
                La humedad ha superado el 80%. Verificar sistema de deshumidificación.
              </Text>
            </View>
          </BlurView>
        )}
      </Screen>

      {/* Sensor Selection Modal */}
      <Modal
        visible={showSensorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSensorModal(false)}
      >
        <View style={globalStyles.modalOverlay}>
          <TouchableOpacity 
            style={globalStyles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowSensorModal(false)}
          />
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Seleccionar Sensor</Text>
              <TouchableOpacity 
                onPress={() => setShowSensorModal(false)}
                style={globalStyles.modalCloseButton}
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
                    globalStyles.sensorOption,
                    selectedSensor?.sensorId === item.sensorId && globalStyles.selectedSensorOption
                  ]}
                  onPress={() => {
                    setSelectedSensor(item);
                    setShowSensorModal(false);
                  }}
                >
                  <View style={globalStyles.sensorOptionContent}>
                    <Ionicons 
                      name="location-outline" 
                      size={20} 
                      color={isDark ? '#FFFFFF' : '#000000'} 
                    />
                    <View style={globalStyles.sensorOptionInfo}>
                      <Text style={globalStyles.sensorOptionLocation}>{item.ubicacion}</Text>
                      <Text style={globalStyles.sensorOptionId}>ID: {item.sensorId}</Text>
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
    </ProtectedRoute>
  );
}
