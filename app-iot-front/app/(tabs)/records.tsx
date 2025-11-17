import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ExportModal } from '../../components/ui/modals';
import { ProtectedRoute } from '../../components/auth';
import { LiquidGlassCard } from '../../components/ui/cards';
import { useTheme } from '../../contexts/ThemeContext';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { sensorApi, SensorData } from '../../services/sensorApi';

interface SensorRecord {
  id: string;
  sensorId: string;
  temperature: number;
  humidity: number;
  status: 'online' | 'offline' | 'warning' | 'error';
  timestamp: string;
  actuator: string; // Cambiado de location a actuator
}

export default function RecordsScreen() {
  const { isDark } = useTheme();
  const { contentPaddingBottom } = useTabBarHeight();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'warning' | 'error'>('all');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [temperatureRange, setTemperatureRange] = useState<{ min: number; max: number }>({ min: 0, max: 50 });
  const [humidityRange, setHumidityRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading sensor records...');
      const data = await sensorApi.getAllSensors();
      console.log('Raw API data:', data);
      console.log('Data length:', data.length);
      console.log('First record:', data[0]);
      setSensorData(data);
      console.log(`   Loaded ${data.length} sensor records`);
    } catch (error) {
      console.error('  Error loading sensor records:', error);
      console.error('  Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, []);

  // Convert SensorData to SensorRecord format for display
  const convertToRecords = (data: SensorData[]): SensorRecord[] => {
    return data.map((sensor, index) => ({
      id: sensor._id,
      sensorId: `S-${String(index + 1).padStart(3, '0')}`,
      temperature: sensor.temperatura,
      humidity: sensor.humedad,
      status: sensor.estado === 'caliente' ? 'warning' : 
              sensor.estado === 'frio' ? 'error' : 'online',
      timestamp: new Date(sensor.fecha).toLocaleString('es-ES'),
      actuator: sensor.actuador, // Usar el actuador real de la API
    }));
  };

  const records = convertToRecords(sensorData);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Normal';
      case 'warning': return 'Caliente';
      case 'error': return 'Frío';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#34C759'; // Normal - Verde
      case 'warning': return '#FF3B30'; // Caliente - Rojo
      case 'error': return '#5AC8FA';   // Frío - Celeste
      default: return isDark ? '#FFFFFF' : '#000000';
    }
  };

  // Optimized filtering and search with memoization
  const filteredRecords = React.useMemo(() => {
    if (!records.length) return [];
    
    return records.filter(record => {
      // Basic status filter - early return for better performance
      if (selectedFilter !== 'all' && record.status !== selectedFilter) return false;
      
      // Search query filter - optimized with early returns
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase().trim();
        const sensorIdLower = record.sensorId.toLowerCase();
        const actuatorLower = record.actuator.toLowerCase();
        const timestampLower = record.timestamp.toLowerCase();
        const statusLower = getStatusText(record.status).toLowerCase();
        
        // Check most common searches first for better performance
        if (!sensorIdLower.includes(query) && 
            !actuatorLower.includes(query) && 
            !timestampLower.includes(query) &&
            !record.temperature.toString().includes(query) &&
            !record.humidity.toString().includes(query) &&
            !statusLower.includes(query)) {
          return false;
        }
      }
      
      // Range filters - only apply if ranges are not default
      if (temperatureRange.min !== 0 || temperatureRange.max !== 50) {
        if (record.temperature < temperatureRange.min || record.temperature > temperatureRange.max) return false;
      }
      
      if (humidityRange.min !== 0 || humidityRange.max !== 100) {
        if (record.humidity < humidityRange.min || record.humidity > humidityRange.max) return false;
      }
      
      // Date filter
      if (dateFilter) {
        const recordDate = new Date(record.timestamp);
        const filterDate = new Date(dateFilter);
        const isSameDay = recordDate.getDate() === filterDate.getDate() &&
                         recordDate.getMonth() === filterDate.getMonth() &&
                         recordDate.getFullYear() === filterDate.getFullYear();
        
        if (!isSameDay) return false;
      }
      
      return true;
    });
  }, [records, selectedFilter, debouncedSearchQuery, temperatureRange, humidityRange, dateFilter]);

  // Optimized sorting with memoization
  const sortedRecords = React.useMemo(() => {
    if (!filteredRecords.length) return [];
    
    return [...filteredRecords].sort((a, b) => {
      // Por defecto ordenar por fecha
      let comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      
      // Aplicar orden ascendente o descendente
      if (sortOrder === 'asc') {
        comparison = -comparison; // Invertir para ascendente
      }
      
      return comparison;
    });
  }, [filteredRecords, sortOrder]);

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'online': return styles.recordCardNormal;
      case 'warning': return styles.recordCardCaliente;
      case 'error': return styles.recordCardFrio;
      default: return {};
    }
  };


  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortOrder('desc');
    setTemperatureRange({ min: 0, max: 50 });
    setHumidityRange({ min: 0, max: 100 });
    setDateFilter(null);
  };

  // Quick filter functions
  const applyQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'today':
        // Filtrar registros de hoy con fecha específica
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día
        setDateFilter(today.toISOString());
        setSelectedFilter('all'); // Mostrar todos los estados para hoy
        break;
      case 'alerts':
        setSelectedFilter('warning');
        setDateFilter(null); // Limpiar filtro de fecha
        break;
      default:
        break;
    }
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedFilter !== 'all' || 
    temperatureRange.min !== 0 || temperatureRange.max !== 50 ||
    humidityRange.min !== 0 || humidityRange.max !== 100 ||
    dateFilter !== null;

  const renderRecord = ({ item }: { item: SensorRecord }) => (
    <LiquidGlassCard style={[styles.recordCard, getCardStyle(item.status)]}>
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <Text style={styles.sensorId}>{item.sensorId}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.recordData}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Temperatura:</Text>
            <Text style={styles.dataValue}>
              {item.status === 'offline' ? 'N/A' : `${item.temperature}°C`}
            </Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Humedad:</Text>
            <Text style={styles.dataValue}>
              {item.status === 'offline' ? 'N/A' : `${item.humidity}%`}
            </Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Actuador:</Text>
            <Text style={styles.dataValue}>{item.actuator}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Fecha:</Text>
            <Text style={styles.dataValue}>{item.timestamp}</Text>
          </View>
        </View>
      </View>
    </LiquidGlassCard>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
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
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      letterSpacing: -0.2,
    },
    exportButtonHeader: {
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
    },
    totalReadings: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '600',
      marginTop: 4,
    },
    listContainer: {
      padding: 20,
    },
    recordCard: {
      marginBottom: 12,
      // Los estilos de Liquid Glass se manejan en el componente base
    },
    // Status-specific card styles with Liquid Glass effect - Blanco y Negro
    recordCardNormal: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    recordCardCaliente: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    recordCardFrio: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    recordContent: {
      padding: 20,
    },
    recordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sensorId: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    status: {
      fontSize: 14,
      fontWeight: '500',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    recordData: {
      gap: 8,
    },
    dataItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dataLabel: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '400',
    },
    dataValue: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
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
    },
    exportButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      // Liquid Glass effect - Sin sombras
      // Responsive design
      minWidth: 80,
      maxWidth: 120,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      elevation: 10,
    },
    exportButtonText: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      flexShrink: 1,
    },
    // Search and Advanced Filters Styles
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 15,
      gap: 10,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    advancedFilterButton: {
      padding: 8,
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.1)',
      borderRadius: 8,
    },
    advancedFiltersContainer: {
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 12,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    sortButtonsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 4,
    },
    sortScrollView: {
      flex: 1,
      maxWidth: 280,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      gap: 4,
    },
    sortButtonActive: {
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.2)',
      borderColor: isDark ? 'rgba(10, 132, 255, 0.4)' : 'rgba(0, 122, 255, 0.4)',
    },
    sortButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    sortButtonTextActive: {
      color: '#FFFFFF',
    },
    clearFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 59, 48, 0.1)',
      borderRadius: 8,
      gap: 6,
    },
    clearFiltersText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#FF453A' : '#FF3B30',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? '#8E8E93' : '#6D6D70',
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 20,
    },
    // Search and Filters Container
    searchAndFiltersContainer: {
      backgroundColor: 'transparent',
    },
    // Quick Filter Chips Styles
    quickFiltersWrapper: {
      backgroundColor: 'transparent',
      zIndex: 10,
  
    },
    quickFiltersContainer: {
      marginBottom: 15,
      backgroundColor: 'transparent',
      zIndex: 10,
    },
    quickFiltersContent: {
      paddingHorizontal: 20,
      gap: 8,
    },
    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      gap: 6,
      marginRight: 8,
      zIndex: 15,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    quickFilterChipActive: {
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.3)',
      borderColor: isDark ? 'rgba(10, 132, 255, 0.5)' : 'rgba(0, 122, 255, 0.5)',
      zIndex: 20,
      elevation: 10,
    },
    quickFilterText: {
      fontSize: 12,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    quickFilterTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    clearFilterChip: {
      backgroundColor: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 59, 48, 0.1)',
      borderColor: isDark ? 'rgba(255, 69, 58, 0.3)' : 'rgba(255, 59, 48, 0.3)',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Datos de sensores en tiempo real</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Obteniendo registro{loadingDots}</Text>
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
              <Ionicons name="list-outline" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Datos de sensores en tiempo real</Text>
              <Text style={styles.totalReadings}>Total: {sensorData.length} lecturas</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.exportButtonHeader}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={styles.exportButtonText}>Exportar</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Search and Filters Component */}
      <View style={styles.searchAndFiltersContainer}>
        {/* Quick Filters */}
        <View style={styles.quickFiltersWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickFiltersContainer}
            contentContainerStyle={styles.quickFiltersContent}
          >
            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                selectedFilter === 'all' && styles.quickFilterChipActive
              ]}
              onPress={() => setSelectedFilter('all')}
            >
              <Ionicons 
                name="apps-outline" 
                size={16} 
                color={selectedFilter === 'all' ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000')} 
              />
              <Text style={[
                styles.quickFilterText,
                selectedFilter === 'all' && styles.quickFilterTextActive
              ]}>
                Todos ({records.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                selectedFilter === 'online' && styles.quickFilterChipActive
              ]}
              onPress={() => setSelectedFilter('online')}
            >
              <Ionicons 
                name="checkmark-circle-outline" 
                size={16} 
                color={selectedFilter === 'online' ? '#FFFFFF' : '#34C759'} 
              />
              <Text style={[
                styles.quickFilterText,
                selectedFilter === 'online' && styles.quickFilterTextActive
              ]}>
                Normal ({records.filter(r => r.status === 'online').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                selectedFilter === 'warning' && styles.quickFilterChipActive
              ]}
              onPress={() => setSelectedFilter('warning')}
            >
              <Ionicons 
                name="warning-outline" 
                size={16} 
                color={selectedFilter === 'warning' ? '#FFFFFF' : '#FF3B30'} 
              />
              <Text style={[
                styles.quickFilterText,
                selectedFilter === 'warning' && styles.quickFilterTextActive
              ]}>
                Caliente ({records.filter(r => r.status === 'warning').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                selectedFilter === 'error' && styles.quickFilterChipActive
              ]}
              onPress={() => setSelectedFilter('error')}
            >
              <Ionicons 
                name="snow-outline" 
                size={16} 
                color={selectedFilter === 'error' ? '#FFFFFF' : '#5AC8FA'} 
              />
              <Text style={[
                styles.quickFilterText,
                selectedFilter === 'error' && styles.quickFilterTextActive
              ]}>
                Frío ({records.filter(r => r.status === 'error').length})
              </Text>
            </TouchableOpacity>

            {/* Quick Action Filters */}
            <TouchableOpacity
              style={styles.quickFilterChip}
              onPress={() => applyQuickFilter('today')}
            >
              <Ionicons name="today-outline" size={16} color="#007AFF" />
              <Text style={styles.quickFilterText}>Hoy</Text>
            </TouchableOpacity>

            {hasActiveFilters && (
              <TouchableOpacity
                style={[styles.quickFilterChip, styles.clearFilterChip]}
                onPress={clearFilters}
              >
                <Ionicons name="close-circle" size={16} color="#FF3B30" />
                <Text style={[styles.quickFilterText, { color: '#FF3B30' }]}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por sensor, actuador, fecha..."
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Advanced Filters Toggle */}
          <TouchableOpacity
            style={styles.advancedFilterButton}
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Ionicons 
              name={showAdvancedFilters ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={isDark ? '#0A84FF' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      </View>


      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <View style={styles.advancedFiltersContainer}>
          {/* Sort Controls */}
          <View style={styles.sortContainer}>
            <Text style={styles.filterLabel}>Ordenar:</Text>
            <View style={styles.sortButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOrder === 'asc' && styles.sortButtonActive
                ]}
                onPress={() => setSortOrder('asc')}
              >
                <Ionicons name="arrow-up" size={16} color={sortOrder === 'asc' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} />
                <Text style={[styles.sortButtonText, sortOrder === 'asc' && styles.sortButtonTextActive]}>
                  Ascendente
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOrder === 'desc' && styles.sortButtonActive
                ]}
                onPress={() => setSortOrder('desc')}
              >
                <Ionicons name="arrow-down" size={16} color={sortOrder === 'desc' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} />
                <Text style={[styles.sortButtonText, sortOrder === 'desc' && styles.sortButtonTextActive]}>
                  Descendente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Clear Filters Button */}
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Ionicons name="refresh-outline" size={16} color={isDark ? '#FF453A' : '#FF3B30'} />
            <Text style={styles.clearFiltersText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </View>
      )}


      <FlatList
        data={sortedRecords}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron registros que coincidan con la búsqueda' : 'No hay registros disponibles'}
            </Text>
          </View>
        }
      />

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
      </View>
    </ProtectedRoute>
  );
}
