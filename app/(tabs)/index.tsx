import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import CustomDateRangeSelector, { DateRange } from '../../components/CustomDateRangeSelector';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import TimeRangeSelector, { TimeRange } from '../../components/TimeRangeSelector';
import LiquidGlassCard from '../../components/ui/LiquidGlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { sensorApi, SensorData, SensorStats } from '../../services/sensorApi';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
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
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('hours');
  const [showTimeRangeSelector, setShowTimeRangeSelector] = useState(false);
  const [showCustomDateSelector, setShowCustomDateSelector] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);

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
      
      // Check notifications for latest sensor data
      if (latest) {
        notificationService.checkSensorData(latest);
      }
      
      // Get chart data based on selected time range - Only last hours for dashboard
      let chart = await sensorApi.getLastHoursData();
      let weekly = await sensorApi.getLastHoursData();
      
      setChartData(chart);
      setWeeklyData(weekly);
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
          console.log('showCustomDateSelector changed to:', showCustomDateSelector);
  }, [showCustomDateSelector]);

  useEffect(() => {
    loadData();
  }, [selectedTimeRange, customDateRange]);

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
    if (dataLength <= 10) return 200;
    if (dataLength <= 30) return 220;
    if (dataLength <= 50) return 240;
    return 260;
  };

  const handleTimeRangeSelect = (range: TimeRange) => {
    console.log('handleTimeRangeSelect called with:', range);
    setSelectedTimeRange(range);
    if (range === 'custom') {
      console.log('Opening custom date selector...');
      setShowTimeRangeSelector(false); // Cerrar el selector de tiempo
      setShowCustomDateSelector(true); // Abrir el selector de fechas
    }
  };

  const handleCustomDateRangeSelect = (dateRange: DateRange) => {
    console.log('Custom date range selected:', dateRange);
    setCustomDateRange(dateRange);
    setSelectedTimeRange('custom');
    setShowCustomDateSelector(false); // Cerrar el selector de fechas
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case 'hours': return 'Últimas horas';
      case 'today': return 'Hoy';
      case 'week': return 'Semana';
      case 'month': return 'Mes';
      case 'custom': 
        if (customDateRange) {
          const start = customDateRange.startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          const end = customDateRange.endDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          return `${start} - ${end}`;
        }
        return 'Personalizado';
      default: return 'Últimas horas';
    }
  };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
      letterSpacing: -0.5,
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
    timeRangeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    timeRangeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginLeft: 8,
    },
});

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Bienvenido, {user?.username || 'Cargando...'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando datos en tiempo real...</Text>
        </View>
        {/* Time Range Selector Modal */}
        <TimeRangeSelector
          visible={showTimeRangeSelector}
          onClose={() => setShowTimeRangeSelector(false)}
          selectedRange={selectedTimeRange}
          onSelectRange={handleTimeRangeSelect}
        />

              {/* Custom Date Range Selector Modal */}
      <CustomDateRangeSelector
        visible={showCustomDateSelector}
        onClose={() => {
          console.log('Closing custom date selector');
          setShowCustomDateSelector(false);
        }}
        onSelectRange={handleCustomDateRangeSelect}
      />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Bienvenido, {user?.username || 'Cargando...'}
            </Text>
          </View>
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
                  {latestSensor ? `${latestSensor.temperatura}°C` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Temperatura</Text>
                <Text style={styles.statSubtitle}>Actual</Text>
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
                  {latestSensor ? `${latestSensor.humedad}%` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Humedad</Text>
                <Text style={styles.statSubtitle}>Actual</Text>
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
                  {latestSensor?.actuador || 'Ninguno'}
                </Text>
                <Text style={styles.statLabel}>Actuador</Text>
                <Text style={styles.statSubtitle}>Estado</Text>
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
              Temperatura (Últimas 6 horas) - {getDataInfo(chartData.length)}
            </Text>
            {getTemperatureData().datasets[0].data.length > 0 ? (
              <LineChart
                key={`temp-${isDark ? 'dark' : 'light'}`}
                data={getTemperatureData()}
                width={screenWidth - 80}
                height={getChartHeight(chartData.length)}
                chartConfig={getChartConfig()}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
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
              Humedad (Últimas 6 horas) - {getDataInfo(weeklyData.length)}
            </Text>
            {getHumidityData().datasets[0].data.length > 0 ? (
              <BarChart
                key={`humidity-${isDark ? 'dark' : 'light'}`}
                data={getHumidityData()}
                width={screenWidth - 80}
                height={getChartHeight(weeklyData.length)}
                chartConfig={getChartConfig()}
                yAxisLabel=""
                yAxisSuffix="%"
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            ) : (
              <Text style={styles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </BlurView>

        {/* Alerts */}
        {latestSensor && latestSensor.estado === 'caliente' && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="flame" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Estado Caliente</Text>
              </View>
              <Text style={styles.alertMessage}>
                El sensor está en estado caliente. Temperatura: {latestSensor.temperatura}°C, Humedad: {latestSensor.humedad}%
              </Text>
            </View>
          </View>
        )}

        {latestSensor && latestSensor.estado === 'frio' && (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Ionicons name="snow" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={styles.alertTitle}>Estado Frío</Text>
              </View>
              <Text style={styles.alertMessage}>
                El sensor está en estado frío. Temperatura: {latestSensor.temperatura}°C, Humedad: {latestSensor.humedad}%
              </Text>
            </View>
          </View>
        )}

        {latestSensor && latestSensor.temperatura > 40 && (
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

        {latestSensor && latestSensor.temperatura < 0 && (
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

        {latestSensor && latestSensor.humedad > 80 && (
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
      </View>
    </ProtectedRoute>
  );
}
