import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

export type TimeRange = 'hours' | 'today' | 'week' | 'month' | 'custom';

export interface TimeRangeOption {
  key: TimeRange;
  label: string;
  icon: string;
  description: string;
  days?: number;
}

interface TimeRangeSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
}

const timeRangeOptions: TimeRangeOption[] = [
  {
    key: 'hours',
    label: 'Últimas horas',
    icon: 'hourglass-outline',
    description: 'Datos de las últimas 6 horas',
    days: 0.25,
  },
  {
    key: 'today',
    label: 'Hoy',
    icon: 'today-outline',
    description: 'Todos los datos de hoy',
    days: 0,
  },
  {
    key: 'week',
    label: 'Última semana',
    icon: 'calendar-outline',
    description: 'Datos de los últimos 7 días',
    days: 7,
  },
  {
    key: 'month',
    label: 'Último mes',
    icon: 'calendar-clear-outline',
    description: 'Datos de los últimos 30 días',
    days: 30,
  },
  {
    key: 'custom',
    label: 'Personalizado',
    icon: 'options-outline',
    description: 'Seleccionar rango personalizado',
  },
];

export default function TimeRangeSelector({
  visible,
  onClose,
  selectedRange,
  onSelectRange,
}: TimeRangeSelectorProps) {
  const { isDark } = useTheme();

  const handleSelectRange = (range: TimeRange) => {
    onSelectRange(range);
    // No cerrar automáticamente si es 'custom', ya que necesitamos abrir el selector de fechas
    if (range !== 'custom') {
      onClose();
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      maxHeight: '70%',
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      textAlign: 'center',
    },
    scrollContent: {
      padding: 20,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    optionItemSelected: {
      backgroundColor: isDark ? '#0A84FF' : '#007AFF',
      borderColor: isDark ? '#0A84FF' : '#007AFF',
    },
    optionIcon: {
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      marginBottom: 4,
    },
    optionLabelSelected: {
      color: '#FFFFFF',
    },
    optionDescription: {
      fontSize: 14,
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    optionDescriptionSelected: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    cancelButton: {
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              <Ionicons name="time-outline" size={24} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
              {' '}Seleccionar Rango de Tiempo
            </Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {timeRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  selectedRange === option.key && styles.optionItemSelected,
                ]}
                onPress={() => handleSelectRange(option.key)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={
                      selectedRange === option.key
                        ? '#FFFFFF'
                        : isDark ? '#FFFFFF' : '#1D1D1F'
                    }
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedRange === option.key && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      selectedRange === option.key && styles.optionDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
