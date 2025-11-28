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
  FlatList,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { CustomDateRangeSelector, DateRange } from '../../components/ui/inputs';
import { ProtectedRoute } from '../../components/auth';
import ScrollableChart from '../../components/ScrollableChart';
import { TimeRangeSelector, TimeRange } from '../../components/ui/inputs';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalStyles } from '../../styles';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { sensorApi } from '../../services/sensorApi';
import { userPreferencesApi } from '../../services/userPreferencesApi';

const screenWidth = Dimensions.get('window').width;

export default function HistoricsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const globalStyles = useGlobalStyles();
  const { contentPaddingBottom } = useTabBarHeight();
  
  const [sensorData, setSensorData] = useState<Array<{ fecha: string; temperatura: number; humedad: number }>>([]);
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
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');
  const [showTimeRangeSelector, setShowTimeRangeSelector] = useState(false);
  const [showCustomDateSelector, setShowCustomDateSelector] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [uniqueSensors, setUniqueSensors] = useState<any[]>([]);
  const [showSensorModal, setShowSensorModal] = useState(false);

  const loadPreferredSensorAndSetSensor = async (uniqueSensorsArray: any[]) => {
    try {
      if (!user?.id || !user?.token) return;

      // Load preferred sensor ID from API
      const preferredSensorId = await userPreferencesApi.getPreferredSensor(user.id, user.token);

      if (preferredSensorId) {
        // Find sensor with preferred sensor ID
        const preferredSensor = uniqueSensorsArray.find(sensor => sensor.sensorId === preferredSensorId);
        if (preferredSensor) {
          setSelectedSensor(preferredSensor);
          console.log(`Using preferred sensor in historics: ${preferredSensorId}`);
          return;
        }
      }

      // Fallback to default logic if no preferred sensor or sensor not found
      if (!selectedSensor && uniqueSensorsArray.length > 0) {
        setSelectedSensor(uniqueSensorsArray[0]);
      }
    } catch (error) {
      console.error('Error loading preferred sensor in historics:', error);
      // Fallback to default logic
      if (!selectedSensor && uniqueSensorsArray.length > 0) {
        setSelectedSensor(uniqueSensorsArray[0]);
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading historical data...');
      
      // Load data based on selected time range
      let data: Array<{ fecha: string; temperatura: number; humedad: number }>;
      
      switch (selectedTimeRange) {
        case 'today':
          data = await sensorApi.getTodayData();
          break;
        case 'week':
          data = await sensorApi.getWeeklyData();
          break;
        case 'month':
          data = await sensorApi.getMonthlyData();
          break;
        case 'custom':
          if (customDateRange) {
            data = await sensorApi.getCustomRangeData(customDateRange.startDate, customDateRange.endDate);
          } else {
            data = await sensorApi.getWeeklyData();
          }
          break;
        default:
          data = await sensorApi.getTodayData();
      }
      
      setSensorData(data);
      
      // Load unique sensors for selector
      const allSensors = await sensorApi.getAllSensors();
      const uniqueSensorMap = new Map<string, any>();
      allSensors.forEach((sensor: any) => {
        if (sensor.sensorId && !uniqueSensorMap.has(sensor.sensorId)) {
          uniqueSensorMap.set(sensor.sensorId, sensor);
        }
      });
      const uniqueSensorsArray = Array.from(uniqueSensorMap.values());
      setUniqueSensors(uniqueSensorsArray);
      
      // Load preferred sensor and set selected sensor
      await loadPreferredSensorAndSetSensor(uniqueSensorsArray);
      
      console.log('Historical data loaded successfully');
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedSensorData = async (sensor: any) => {
    try {
      console.log('Loading historical data for sensor:', sensor.sensorId);
      
      // Load data based on selected time range for specific sensor
      let data: Array<{ fecha: string; temperatura: number; humedad: number }>;
      
      switch (selectedTimeRange) {
        case 'today':
          data = await sensorApi.getTodayDataBySensorId(sensor.sensorId);
          break;
        case 'week':
          data = await sensorApi.getWeeklyDataBySensorId(sensor.sensorId);
          break;
        case 'month':
          data = await sensorApi.getMonthlyDataBySensorId(sensor.sensorId);
          break;
        case 'custom':
          if (customDateRange) {
            data = await sensorApi.getCustomRangeDataBySensorId(sensor.sensorId, customDateRange.startDate, customDateRange.endDate);
          } else {
            data = await sensorApi.getWeeklyDataBySensorId(sensor.sensorId);
          }
          break;
        default:
          data = await sensorApi.getTodayDataBySensorId(sensor.sensorId);
      }
      
      setSensorData(data);
      
    } catch (error) {
      console.error('Error loading selected sensor historical data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedTimeRange, customDateRange]);

  useEffect(() => {
    if (selectedSensor) {
      loadSelectedSensorData(selectedSensor);
    }
  }, [selectedSensor]);

  // LineChart - Serie temporal de temperatura
  const getTemperatureTimeSeries = () => {
    const data = sensorData; // Usar todos los datos disponibles
    return {
      labels: data.map(item => {
        const date = new Date(item.fecha);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
      datasets: [
        {
          data: data.map(item => item.temperatura),
          color: (opacity = 1) => isDark ? `rgba(255, 69, 58, ${opacity})` : `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Análisis de tendencias por hora del día
  const getHourlyTrends = () => {
    const hourlyData = sensorData.reduce((acc, sensor) => {
      const hour = new Date(sensor.fecha).getHours();
      if (!acc[hour]) {
        acc[hour] = { temp: [], humidity: [] };
      }
      acc[hour].temp.push(sensor.temperatura);
      acc[hour].humidity.push(sensor.humedad);
      return acc;
    }, {} as Record<number, { temp: number[]; humidity: number[] }>);

    const hours = Object.keys(hourlyData).sort((a, b) => parseInt(a) - parseInt(b));
    
    return {
      labels: hours.map(h => `${h}:00`),
      datasets: [
        {
          data: hours.map(h => {
            const temps = hourlyData[parseInt(h)].temp;
            return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
          }),
          color: (opacity = 1) => isDark ? `rgba(255, 69, 58, ${opacity})` : `rgba(255, 59, 48, ${opacity})`,
        },
      ],
    };
  };

  // PieChart - Distribución de estados (simplificado)
  const getStatusDistribution = () => {
    // Simulate status distribution based on temperature ranges
    const statusCount = sensorData.reduce((acc, sensor) => {
      let status = 'normal';
      if (sensor.temperatura > 30) status = 'caliente';
      else if (sensor.temperatura < 15) status = 'frio';
      
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      normal: isDark ? '#30D158' : '#34C759',
      caliente: isDark ? '#FF453A' : '#FF3B30',
      frio: isDark ? '#0A84FF' : '#007AFF',
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      population: count,
      color: colors[status as keyof typeof colors] || '#8E8E93',
      legendFontColor: isDark ? '#FFFFFF' : '#1D1D1F',
    }));
  };

  // Análisis de variabilidad y extremos
  const getVariabilityAnalysis = () => {
    const data = sensorData; // Usar todos los datos disponibles
    const temps = data.map(item => item.temperatura);
    const humidities = data.map(item => item.humedad);
    
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    const tempAvg = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    
    const humidityMin = Math.min(...humidities);
    const humidityMax = Math.max(...humidities);
    const humidityAvg = humidities.reduce((sum, hum) => sum + hum, 0) / humidities.length;
    
    return {
      labels: data.map((_, index) => `${index + 1}`),
      datasets: [
        {
          data: temps,
          color: (opacity = 1) => isDark ? `rgba(255, 69, 58, ${opacity})` : `rgba(255, 59, 48, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: humidities,
          color: (opacity = 1) => isDark ? `rgba(0, 122, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Análisis de eficiencia del sistema
  const getEfficiencyAnalysis = () => {
    // Simulate efficiency metrics based on temperature and humidity data
    const efficiencyData = sensorData.reduce((acc, sensor) => {
      let efficiency = 'Óptima';
      if (sensor.temperatura > 30 || sensor.temperatura < 15) efficiency = 'Baja';
      else if (sensor.temperatura > 25 || sensor.temperatura < 20) efficiency = 'Media';
      
      acc[efficiency] = (acc[efficiency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(efficiencyData),
      datasets: [
        {
          data: Object.values(efficiencyData),
          color: (opacity = 1) => isDark ? `rgba(88, 86, 214, ${opacity})` : `rgba(88, 86, 214, ${opacity})`,
        },
      ],
    };
  };

  const getChartConfig = () => ({
    backgroundColor: isDark ? 'transparent' : '#FFFFFF',
    backgroundGradientFrom: isDark ? 'transparent' : '#FFFFFF',
    backgroundGradientTo: isDark ? 'transparent' : '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(29, 29, 31, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity * 0.8})` : `rgba(29, 29, 31, ${opacity * 0.8})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(29, 29, 31, 0.1)',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: screenWidth < 400 ? 8 : 10,
    },
    propsForVerticalLabels: {
      fontSize: screenWidth < 400 ? 8 : 10,
    },
    propsForHorizontalLabels: {
      fontSize: screenWidth < 400 ? 8 : 10,
    },
  });

  const handleTimeRangeSelect = (range: TimeRange) => {
    setSelectedTimeRange(range);
    if (range === 'custom') {
      setShowTimeRangeSelector(false);
      setShowCustomDateSelector(true);
    }
  };

  const handleCustomDateRangeSelect = (dateRange: DateRange) => {
    setCustomDateRange(dateRange);
    setSelectedTimeRange('custom');
    setShowCustomDateSelector(false);
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
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
      default: return 'Hoy';
    }
  };

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
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginLeft: 8,
    },
    // Chart styles now use globalStyles.chartContainer, chartContent, chartTitle
    chartDescription: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 16,
      lineHeight: 20,
    },
    // Loading styles now use globalStyles.loadingContainer, loadingText
    pieChartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    // Sensor selector styles now use globalStyles.sensorSelectorContainer, sensorSelectorButton, sensorSelectorText
    // Modal styles now use globalStyles.modalOverlay, modalBackdrop, modalContent, modalHeader, modalTitle, modalCloseButton
    // Sensor option styles now use globalStyles.sensorOption, selectedSensorOption, sensorOptionContent, sensorOptionInfo, sensorOptionLocation, sensorOptionId
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Análisis detallado de datos</Text>
        </View>
        <View style={globalStyles.loadingContainer}>
          <Text style={globalStyles.loadingText}>Obteniendo registro{loadingDots}</Text>
        </View>
      </View>
    );
  }

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
              <Ionicons name="analytics-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <Text style={styles.headerTitle}>Análisis detallado de datos</Text>
            <TouchableOpacity
              style={styles.timeRangeButton}
              onPress={() => setShowTimeRangeSelector(true)}
            >
              <Ionicons name="time-outline" size={18} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
              <Text style={styles.timeRangeButtonText}>
                {getTimeRangeLabel(selectedTimeRange)}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Sensor Selector Button */}
      {selectedSensor && uniqueSensors.length > 1 && (
        <View style={globalStyles.sensorSelectorContainer}>
          <TouchableOpacity
            style={globalStyles.sensorSelectorButton}
            onPress={() => setShowSensorModal(true)}
          >
            <Ionicons name="hardware-chip-outline" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={globalStyles.sensorSelectorText}>{selectedSensor.sensorId}</Text>
            <Ionicons name="chevron-down-outline" size={14} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
                 {/* LineChart - Serie temporal */}
         <View style={[globalStyles.chartContainer, { marginHorizontal: screenWidth < 400 ? 10 : 0 }]}>
           <View style={globalStyles.chartContent}>
             <Text style={globalStyles.chartTitle}>
               <Ionicons name="trending-up-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
               {' '}Serie Temporal - Temperatura
             </Text>
             <Text style={styles.chartDescription}>
               Muestra cómo varía la temperatura a lo largo del tiempo seleccionado.
             </Text>
            {getTemperatureTimeSeries().datasets[0].data.length > 0 ? (
              <ScrollableChart 
                dataLength={sensorData.length}
                maxVisiblePoints={8}
                chartWidth={Math.max(screenWidth - 80, Math.max(sensorData.length * 50, (screenWidth - 80) * 1.2))}
              >
                <LineChart
                  data={getTemperatureTimeSeries()}
                  width={Math.max(screenWidth - 80, Math.max(sensorData.length * 50, (screenWidth - 80) * 1.2))}
                  height={220}
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
        </View>

                 {/* BarChart - Comparación de promedios */}
         <View style={[globalStyles.chartContainer, { marginHorizontal: screenWidth < 400 ? 10 : 0 }]}>
           <View style={globalStyles.chartContent}>
             <Text style={globalStyles.chartTitle}>
               <Ionicons name="time-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
               {' '}Tendencias por Hora del Día
             </Text>
             <Text style={styles.chartDescription}>
               Temperatura promedio por hora del día. Útil para identificar patrones diarios y horarios más calientes/fríos.
             </Text>
                         {getHourlyTrends().datasets[0].data.length > 0 ? (
               <ScrollableChart 
                 dataLength={getHourlyTrends().labels.length}
                 maxVisiblePoints={screenWidth < 400 ? 6 : 8}
                 chartWidth={Math.max(screenWidth - 80, Math.max(getHourlyTrends().labels.length * (screenWidth < 400 ? 50 : 40), (screenWidth - 80) * 1.2))}
               >
                 <BarChart
                   data={getHourlyTrends()}
                   width={Math.max(screenWidth - 80, Math.max(getHourlyTrends().labels.length * (screenWidth < 400 ? 50 : 40), (screenWidth - 80) * 1.2))}
                   height={220}
                   chartConfig={getChartConfig()}
                   yAxisLabel=""
                   yAxisSuffix="°C"
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
        </View>

                 {/* PieChart - Distribución de estados */}
         <View style={[globalStyles.chartContainer, { marginHorizontal: screenWidth < 400 ? 10 : 0 }]}>
           <View style={globalStyles.chartContent}>
             <Text style={globalStyles.chartTitle}>
               <Ionicons name="pie-chart-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
               {' '}Distribución de Estados
             </Text>
             <Text style={styles.chartDescription}>
               Porcentaje de tiempo en cada estado (Bajo, Normal, Alto). Muestra claramente cómo se comporta el ambiente.
             </Text>
            {getStatusDistribution().length > 0 ? (
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={getStatusDistribution()}
                  width={Math.min(screenWidth - 80, 300)}
                  height={220}
                  chartConfig={getChartConfig()}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <Text style={globalStyles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </View>

                 {/* LineChart - Correlación Temp vs Humedad */}
         <View style={[globalStyles.chartContainer, { marginHorizontal: screenWidth < 400 ? 10 : 0 }]}>
           <View style={globalStyles.chartContent}>
             <Text style={globalStyles.chartTitle}>
               <Ionicons name="analytics-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
               {' '}Análisis de Variabilidad
             </Text>
             <Text style={styles.chartDescription}>
               Muestra la variabilidad de temperatura y humedad. Útil para identificar picos, valles y patrones de cambio.
             </Text>
                         {getVariabilityAnalysis().datasets[0].data.length > 0 ? (
               <ScrollableChart 
                 dataLength={sensorData.length}
                 maxVisiblePoints={10}
                 chartWidth={Math.max(screenWidth - 80, Math.max(sensorData.length * 45, (screenWidth - 80) * 1.2))}
               >
                 <LineChart
                   data={getVariabilityAnalysis()}
                   width={Math.max(screenWidth - 80, Math.max(sensorData.length * 45, (screenWidth - 80) * 1.2))}
                   height={220}
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
        </View>

                 {/* BarChart - Acciones del sistema */}
         <View style={[globalStyles.chartContainer, { marginHorizontal: screenWidth < 400 ? 10 : 0 }]}>
           <View style={globalStyles.chartContent}>
             <Text style={globalStyles.chartTitle}>
               <Ionicons name="speedometer-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
               {' '}Análisis de Eficiencia
             </Text>
             <Text style={styles.chartDescription}>
               Eficiencia del sistema basada en las condiciones ambientales. Muestra qué tan bien se mantienen las condiciones óptimas.
             </Text>
                         {getEfficiencyAnalysis().datasets[0].data.length > 0 ? (
               <ScrollableChart 
                 dataLength={getEfficiencyAnalysis().labels.length}
                 maxVisiblePoints={screenWidth < 400 ? 3 : 6}
                 chartWidth={Math.max(screenWidth - 80, Math.max(getEfficiencyAnalysis().labels.length * (screenWidth < 400 ? 80 : 60), (screenWidth - 80) * 1.2))}
               >
                 <BarChart
                   data={getEfficiencyAnalysis()}
                   width={Math.max(screenWidth - 80, Math.max(getEfficiencyAnalysis().labels.length * (screenWidth < 400 ? 80 : 60), (screenWidth - 80) * 1.2))}
                   height={220}
                   chartConfig={getChartConfig()}
                   yAxisLabel=""
                   yAxisSuffix=" veces"
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
        </View>
      </ScrollView>

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
        onClose={() => setShowCustomDateSelector(false)}
        onSelectRange={handleCustomDateRangeSelect}
      />

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
      </View>
    </ProtectedRoute>
  );
}
