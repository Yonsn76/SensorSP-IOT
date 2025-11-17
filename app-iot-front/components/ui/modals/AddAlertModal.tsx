import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import { getThemeColors } from '../../../constants/Colors';
import { useTheme } from '../../../contexts/ThemeContext';
import { NotificationRule } from '../../../services/notificationService';
import { sensorApi } from '../../../services/sensorApi';
import { LiquidGlassButton } from '../buttons';
import { LiquidGlassModal } from './LiquidGlassModal';

interface AddAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAlert: (rule: NotificationRule) => void;
}

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

export default function AddAlertModal({ visible, onClose, onAddAlert }: AddAlertModalProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  
  const [alertName, setAlertName] = useState('');
  const [alertType, setAlertType] = useState<'temperature' | 'humidity' | 'actuator' | 'status'>('temperature');
  const [condition, setCondition] = useState<'mayor_que' | 'menor_que' | 'igual_a' | 'cambia_a'>('mayor_que');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [locationScope, setLocationScope] = useState<'all' | 'specific'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const alertTypes = [
    { key: 'temperature', label: 'Temperatura', icon: 'thermometer-outline', unit: '°C' },
    { key: 'humidity', label: 'Humedad', icon: 'water-outline', unit: '%' },
    { key: 'actuator', label: 'Actuador', icon: 'settings-outline', unit: '' },
    { key: 'status', label: 'Estado', icon: 'analytics-outline', unit: '' },
  ];

  const conditions = [
    { key: 'mayor_que', label: 'Mayor que' },
    { key: 'menor_que', label: 'Menor que' },
    { key: 'igual_a', label: 'Igual a' },
    { key: 'cambia_a', label: 'Cambia a' },
  ];

  useEffect(() => {
    if (visible) {
      loadAvailableLocations();
    }
  }, [visible]);

  const loadAvailableLocations = async () => {
    try {
      const allSensors = await sensorApi.getAllSensors();
      const uniqueLocations = [...new Set(allSensors.map(sensor => sensor.ubicacion).filter(Boolean))] as string[];
      setAvailableLocations(uniqueLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleAddAlert = () => {
    if (!alertName.trim() || !value.trim() || !message.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (locationScope === 'specific' && !selectedLocation) {
      Alert.alert('Error', 'Por favor selecciona una ubicación específica');
      return;
    }

    const newRule: NotificationRule = {
      id: `custom_${Date.now()}`,
      name: alertName.trim(),
      enabled: false,
      type: alertType,
      condition: condition,
      value: alertType === 'temperature' || alertType === 'humidity' ? parseFloat(value) : value,
      message: message.trim(),
      location: locationScope === 'specific' ? selectedLocation : 'Todas las ubicaciones',
    };

    onAddAlert(newRule);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAlertName('');
    setAlertType('temperature');
    setCondition('mayor_que');
    setValue('');
    setMessage('');
    setLocationScope('all');
    setSelectedLocation('');
    setShowLocationSelector(false);
  };

  const getDefaultMessage = () => {
    const type = alertTypes.find(t => t.key === alertType);
    const cond = conditions.find(c => c.key === condition);
    const unit = type?.unit || '';
    
    switch (alertType) {
      case 'temperature':
        return `Temperatura ${cond?.label.toLowerCase()} ${value}${unit}. Revisar sistema.`;
      case 'humidity':
        return `Humedad ${cond?.label.toLowerCase()} ${value}${unit}. Verificar condiciones.`;
      case 'actuator':
        return `Actuador ${cond?.label.toLowerCase()} ${value}. Revisar estado.`;
      case 'status':
        return `Estado ${cond?.label.toLowerCase()} ${value}. Verificar sistema.`;
      default:
        return '';
    }
  };

  const styles = StyleSheet.create({
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: colors.secondaryButton,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.secondaryButtonBorder,
    },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.secondaryButton,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.secondaryButtonBorder,
    },
    optionButtonSelected: {
      backgroundColor: colors.primaryButton,
      borderColor: colors.primaryButton,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    optionTextSelected: {
      color: '#FFFFFF',
    },
    footer: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      gap: isSmallScreen ? 8 : 12,
      padding: isSmallScreen ? 12 : 16,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
      backgroundColor: colors.background,
    },
    footerButton: {
      flex: isSmallScreen ? 0 : 1,
      minHeight: isSmallScreen ? 44 : 48,
      maxHeight: isSmallScreen ? 50 : 56,
    },
    label: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    locationSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.background,
    },
    locationSelectorText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    locationSelectorPlaceholder: {
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: isSmallScreen ? '70%' : '60%',
      minHeight: isSmallScreen ? '50%' : '40%',
      marginHorizontal: isSmallScreen ? 8 : 0,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isSmallScreen ? 16 : 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    modalTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: '600',
      color: colors.text,
    },
    modalCloseButton: {
      padding: 4,
    },
    locationOption: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    selectedLocationOption: {
      backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
    },
    locationOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationOptionText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
  });

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      maxHeight="80%"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="add-circle-outline" size={24} color={colors.text} />
          {' '}Agregar Nueva Alerta
        </Text>
      </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Nombre de la alerta */}
            <View style={styles.section}>
              <Text style={styles.label}>Nombre de la alerta</Text>
              <TextInput
                style={styles.input}
                value={alertName}
                onChangeText={setAlertName}
                placeholder="Ej: Temperatura crítica"
                placeholderTextColor={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>

            {/* Tipo de alerta */}
            <View style={styles.section}>
              <Text style={styles.label}>Tipo de alerta</Text>
              <View style={styles.optionGrid}>
                                 {alertTypes.map((type) => (
                   <TouchableOpacity
                     key={type.key}
                     style={[
                       styles.optionButton,
                       alertType === type.key && styles.optionButtonSelected,
                     ]}
                     onPress={() => setAlertType(type.key as any)}
                   >
                     <Ionicons 
                       name={type.icon as any} 
                       size={20} 
                       color={alertType === type.key ? '#FFFFFF' : colors.text} 
                     />
                     <Text
                       style={[
                         styles.optionText,
                         alertType === type.key && styles.optionTextSelected,
                       ]}
                     >
                       {type.label}
                     </Text>
                   </TouchableOpacity>
                 ))}
              </View>
            </View>

            {/* Condición */}
            <View style={styles.section}>
              <Text style={styles.label}>Condición</Text>
              <View style={styles.optionGrid}>
                {conditions.map((cond) => (
                  <TouchableOpacity
                    key={cond.key}
                    style={[
                      styles.optionButton,
                      condition === cond.key && styles.optionButtonSelected,
                    ]}
                    onPress={() => setCondition(cond.key as any)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        condition === cond.key && styles.optionTextSelected,
                      ]}
                    >
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Valor */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Valor {alertTypes.find(t => t.key === alertType)?.unit}
              </Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                placeholder={
                  alertType === 'temperature' ? 'Ej: 40' :
                  alertType === 'humidity' ? 'Ej: 80' :
                  'Ej: ventilador'
                }
                placeholderTextColor={isDark ? '#FFFFFF' : '#000000'}
                keyboardType={
                  alertType === 'temperature' || alertType === 'humidity' 
                    ? 'numeric' 
                    : 'default'
                }
              />
            </View>

            {/* Ámbito de ubicación */}
            <View style={styles.section}>
              <Text style={styles.label}>Ámbito de aplicación</Text>
              <View style={styles.optionGrid}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    locationScope === 'all' && styles.optionButtonSelected,
                  ]}
                  onPress={() => setLocationScope('all')}
                >
                  <Ionicons 
                    name="globe-outline" 
                    size={20} 
                    color={locationScope === 'all' ? '#007AFF' : colors.text} 
                  />
                  <Text
                    style={[
                      styles.optionText,
                      locationScope === 'all' && styles.optionTextSelected,
                    ]}
                  >
                    Todas las ubicaciones
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    locationScope === 'specific' && styles.optionButtonSelected,
                  ]}
                  onPress={() => setLocationScope('specific')}
                >
                  <Ionicons 
                    name="location-outline" 
                    size={20} 
                    color={locationScope === 'specific' ? '#007AFF' : colors.text} 
                  />
                  <Text
                    style={[
                      styles.optionText,
                      locationScope === 'specific' && styles.optionTextSelected,
                    ]}
                  >
                    Ubicación específica
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Selector de ubicación específica */}
            {locationScope === 'specific' && (
              <View style={styles.section}>
                <Text style={styles.label}>Seleccionar ubicación</Text>
                <TouchableOpacity
                  style={styles.locationSelector}
                  onPress={() => setShowLocationSelector(true)}
                >
                  <Text style={[
                    styles.locationSelectorText,
                    !selectedLocation && styles.locationSelectorPlaceholder
                  ]}>
                    {selectedLocation || 'Seleccionar ubicación...'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}

            {/* Mensaje */}
            <View style={styles.section}>
              <Text style={styles.label}>Mensaje de la alerta</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={message}
                onChangeText={setMessage}
                placeholder={getDefaultMessage()}
                placeholderTextColor={isDark ? '#FFFFFF' : '#000000'}
                multiline
              />
            </View>
          </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <LiquidGlassButton
          title="Cancelar"
          onPress={() => {
            resetForm();
            onClose();
          }}
          variant="secondary"
          style={styles.footerButton}
        />
        <LiquidGlassButton
          title="Agregar Alerta"
          onPress={handleAddAlert}
          variant="primary"
          icon="add-circle-outline"
          style={styles.footerButton}
        />
      </View>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowLocationSelector(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ubicación</Text>
              <TouchableOpacity 
                onPress={() => setShowLocationSelector(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableLocations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationOption,
                    selectedLocation === item && styles.selectedLocationOption
                  ]}
                  onPress={() => {
                    setSelectedLocation(item);
                    setShowLocationSelector(false);
                  }}
                >
                  <View style={styles.locationOptionContent}>
                    <Ionicons 
                      name="location-outline" 
                      size={20} 
                      color={colors.text} 
                    />
                    <Text style={styles.locationOptionText}>{item}</Text>
                    {selectedLocation === item && (
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
      )}
    </LiquidGlassModal>
  );
}
