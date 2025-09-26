import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import CustomDateRangeSelector, { DateRange } from '../../components/CustomDateRangeSelector';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import ScrollableChart from '../../components/ScrollableChart';
import TimeRangeSelector, { TimeRange } from '../../components/TimeRangeSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { sensorApi } from '../../services/sensorApi';

const screenWidth = Dimensions.get('window').width;

export default function HistoricsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [sensorData, setSensorData] = useState<Array<{ fecha: string; temperatura: number; humedad: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');
  const [showTimeRangeSelector, setShowTimeRangeSelector] = useState(false);
  const [showCustomDateSelector, setShowCustomDateSelector] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);

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
      console.log('Historical data loaded successfully');
    } catch (error) {
      console.error('Error loading historical data:', error);
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
    loadData();
  }, [selectedTimeRange, customDateRange]);

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
      padding: 20,
      paddingTop: 60,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 17,
      color: isDark ? '#8E8E93' : '#6D6D70',
      fontWeight: '400',
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
    chartContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 20,
      marginHorizontal: screenWidth < 400 ? 10 : 0,
      // Liquid Glass effect
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
      // Shadow for depth
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    chartContent: {
      padding: screenWidth < 400 ? 15 : 20,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 16,
    },
    chartDescription: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginBottom: 16,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginTop: 16,
    },
    pieChartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Históricos</Text>
          <Text style={styles.headerSubtitle}>Análisis detallado de datos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando análisis histórico...</Text>
        </View>
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
            <Text style={styles.headerTitle}>Históricos</Text>
            <Text style={styles.headerSubtitle}>Análisis detallado de datos</Text>
          </View>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setShowTimeRangeSelector(true)}
          >
            <Ionicons name="time-outline" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
            <Text style={styles.timeRangeButtonText}>
              {getTimeRangeLabel(selectedTimeRange)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
                 {/* LineChart - Serie temporal */}
         <View style={styles.chartContainer}>
           <View style={styles.chartContent}>
             <Text style={styles.chartTitle}>
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
                chartWidth={Math.max(screenWidth - 80, sensorData.length * 50)}
              >
                <LineChart
                  data={getTemperatureTimeSeries()}
                  width={Math.max(screenWidth - 80, sensorData.length * 50)}
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
              <Text style={styles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </View>

                 {/* BarChart - Comparación de promedios */}
         <View style={styles.chartContainer}>
           <View style={styles.chartContent}>
             <Text style={styles.chartTitle}>
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
                 chartWidth={Math.max(screenWidth - 80, getHourlyTrends().labels.length * (screenWidth < 400 ? 50 : 40))}
               >
                 <BarChart
                   data={getHourlyTrends()}
                   width={Math.max(screenWidth - 80, getHourlyTrends().labels.length * (screenWidth < 400 ? 50 : 40))}
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
               <Text style={styles.loadingText}>No hay datos disponibles</Text>
             )}
          </View>
        </View>

                 {/* PieChart - Distribución de estados */}
         <View style={styles.chartContainer}>
           <View style={styles.chartContent}>
             <Text style={styles.chartTitle}>
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
              <Text style={styles.loadingText}>No hay datos disponibles</Text>
            )}
          </View>
        </View>

                 {/* LineChart - Correlación Temp vs Humedad */}
         <View style={styles.chartContainer}>
           <View style={styles.chartContent}>
             <Text style={styles.chartTitle}>
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
                 chartWidth={Math.max(screenWidth - 80, sensorData.length * 45)}
               >
                 <LineChart
                   data={getVariabilityAnalysis()}
                   width={Math.max(screenWidth - 80, sensorData.length * 45)}
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
               <Text style={styles.loadingText}>No hay datos disponibles</Text>
             )}
          </View>
        </View>

                 {/* BarChart - Acciones del sistema */}
         <View style={styles.chartContainer}>
           <View style={styles.chartContent}>
             <Text style={styles.chartTitle}>
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
                 chartWidth={Math.max(screenWidth - 80, getEfficiencyAnalysis().labels.length * (screenWidth < 400 ? 80 : 60))}
               >
                 <BarChart
                   data={getEfficiencyAnalysis()}
                   width={Math.max(screenWidth - 80, getEfficiencyAnalysis().labels.length * (screenWidth < 400 ? 80 : 60))}
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
               <Text style={styles.loadingText}>No hay datos disponibles</Text>
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
      </View>
    </ProtectedRoute>
  );
}
