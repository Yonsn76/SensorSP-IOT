import { Ionicons } from '@expo/vector-icons';
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
import ExportModal from '../../components/ExportModal';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import LiquidGlassCard from '../../components/ui/LiquidGlassCard';
import { useTheme } from '../../contexts/ThemeContext';
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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'warning' | 'error'>('all');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'temperature' | 'humidity'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [temperatureRange, setTemperatureRange] = useState<{ min: number; max: number }>({ min: 0, max: 50 });
  const [humidityRange, setHumidityRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading sensor records...');
      const data = await sensorApi.getAllSensors();
      console.log('📊 Raw API data:', data);
      console.log('📊 Data length:', data.length);
      console.log('📊 First record:', data[0]);
      setSensorData(data);
      console.log(`✅ Loaded ${data.length} sensor records`);
    } catch (error) {
      console.error('❌ Error loading sensor records:', error);
      console.error('❌ Error details:', error);
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

  // Advanced filtering and search
  const filteredRecords = records.filter(record => {
    // Basic status filter
    if (selectedFilter !== 'all' && record.status !== selectedFilter) return false;
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        record.sensorId.toLowerCase().includes(query) ||
        record.actuator.toLowerCase().includes(query) ||
        record.timestamp.toLowerCase().includes(query) ||
        record.temperature.toString().includes(query) ||
        record.humidity.toString().includes(query) ||
        getStatusText(record.status).toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Temperature range filter
    if (record.temperature < temperatureRange.min || record.temperature > temperatureRange.max) return false;
    
    // Humidity range filter
    if (record.humidity < humidityRange.min || record.humidity > humidityRange.max) return false;
    
    return true;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'recent':
        comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        break;
      case 'oldest':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'temperature':
        comparison = b.temperature - a.temperature; // Más caliente primero
        break;
      case 'humidity':
        comparison = b.humidity - a.humidity; // Más húmedo primero
        break;
    }
    
    return comparison;
  });

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'online': return styles.recordCardNormal;
      case 'warning': return styles.recordCardCaliente;
      case 'error': return styles.recordCardFrio;
      default: return {};
    }
  };

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'recent': return 'Más Recientes';
      case 'oldest': return 'Más Antiguos';
      case 'temperature': return 'Más Calientes';
      case 'humidity': return 'Más Húmedos';
      default: return 'Más Recientes';
    }
  };

  const getSortIcon = (sortBy: string) => {
    switch (sortBy) {
      case 'recent': return 'time-outline';
      case 'oldest': return 'time-outline';
      case 'temperature': return 'thermometer-outline';
      case 'humidity': return 'water-outline';
      default: return 'time-outline';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortBy('recent');
    setTemperatureRange({ min: 0, max: 50 });
    setHumidityRange({ min: 0, max: 100 });
  };

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
    totalReadings: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '600',
      marginTop: 4,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    filterButton: {
      flex: 1,
      borderRadius: 24,
      overflow: 'hidden',
      marginHorizontal: 5,
      // Liquid Glass effect 100% Apple - Sin sombras
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    filterContent: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    filterButtonInactive: {
      backgroundColor: 'transparent',
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    filterButtonTextInactive: {
      color: isDark ? '#FFFFFF' : '#000000',
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
      top: 50,
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
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Registros</Text>
          <Text style={styles.headerSubtitle}>Datos de sensores en tiempo real</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando registros...</Text>
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
            <Text style={styles.headerTitle}>Registros</Text>
            <Text style={styles.headerSubtitle}>Datos de sensores en tiempo real</Text>
            <Text style={styles.totalReadings}>Total: {sensorData.length} lecturas</Text>
          </View>
          
          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={styles.exportButtonText}>Exportar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar registros..."
            placeholderTextColor={isDark ? '#FFFFFF' : '#000000'}
            value={searchQuery}
            onChangeText={setSearchQuery}
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

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <View style={styles.advancedFiltersContainer}>
          {/* Sort Controls */}
          <View style={styles.sortContainer}>
            <Text style={styles.filterLabel}>Ordenar por:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortButtonsContainer}
              style={styles.sortScrollView}
            >
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'recent' && styles.sortButtonActive
                ]}
                onPress={() => setSortBy('recent')}
              >
                <Ionicons name={getSortIcon('recent')} size={16} color={sortBy === 'recent' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} />
                <Text style={[styles.sortButtonText, sortBy === 'recent' && styles.sortButtonTextActive]}>
                  Recientes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'oldest' && styles.sortButtonActive
                ]}
                onPress={() => setSortBy('oldest')}
              >
                <Ionicons name={getSortIcon('oldest')} size={16} color={sortBy === 'oldest' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} />
                <Text style={[styles.sortButtonText, sortBy === 'oldest' && styles.sortButtonTextActive]}>
                  Antiguos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'temperature' && styles.sortButtonActive
                ]}
                onPress={() => setSortBy('temperature')}
              >
                <Ionicons name={getSortIcon('temperature')} size={16} color={sortBy === 'temperature' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} />
                <Text style={[styles.sortButtonText, sortBy === 'temperature' && styles.sortButtonTextActive]}>
                  Calientes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'humidity' && styles.sortButtonActive
                ]}
                onPress={() => setSortBy('humidity')}
              >
                <Ionicons name={getSortIcon('humidity')} size={16} color={sortBy === 'humidity' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#6D6D70')} />
                <Text style={[styles.sortButtonText, sortBy === 'humidity' && styles.sortButtonTextActive]}>
                  Húmedos
                </Text>
              </TouchableOpacity>
            </ScrollView>
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

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <View style={styles.filterButton}>
          <TouchableOpacity
            style={[
              styles.filterContent,
              selectedFilter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'all' ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButton}>
          <TouchableOpacity
            style={[
              styles.filterContent,
              selectedFilter === 'online' ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            onPress={() => setSelectedFilter('online')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'online' ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
              ]}
            >
              En Línea
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButton}>
          <TouchableOpacity
            style={[
              styles.filterContent,
              selectedFilter === 'warning' ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            onPress={() => setSelectedFilter('warning')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'warning' ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
              ]}
            >
              Caliente
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButton}>
          <TouchableOpacity
            style={[
              styles.filterContent,
              selectedFilter === 'error' ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            onPress={() => setSelectedFilter('error')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'error' ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
              ]}
            >
              Frío
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedRecords}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
