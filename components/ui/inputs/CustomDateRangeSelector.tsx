import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface CustomDateRangeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectRange: (dateRange: DateRange) => void;
}

export default function CustomDateRangeSelector({
  visible,
  onClose,
  onSelectRange,
}: CustomDateRangeSelectorProps) {
  const { isDark } = useTheme();
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, firstDayOfWeek };
  };

  const isDateInRange = (date: Date) => {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return current >= start && current <= end;
  };

  const isDateSelected = (date: Date) => {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return current.getTime() === start.getTime() || current.getTime() === end.getTime();
  };

  const handleDatePress = (date: Date) => {
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (!startDate || (startDate && endDate && startDate.getTime() === endDate.getTime())) {
      // First selection or reset
      setStartDate(current);
      setEndDate(current);
    } else if (current < startDate) {
      // Selected date is before start date
      setStartDate(current);
    } else {
      // Selected date is after start date
      setEndDate(current);
    }
  };

  const handleConfirm = () => {
    onSelectRange({ startDate, endDate });
    onClose();
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isInRange = isDateInRange(date);
      const isSelected = isDateSelected(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isInRange && styles.calendarDayInRange,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday,
          ]}
          onPress={() => handleDatePress(date)}
        >
          <Text
            style={[
              styles.calendarDayText,
              isInRange && styles.calendarDayTextInRange,
              isSelected && styles.calendarDayTextSelected,
              isToday && styles.calendarDayTextToday,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
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
      marginBottom: 16,
    },
    dateRangeDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    dateRangeText: {
      fontSize: 14,
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      fontWeight: '500',
    },
    calendarContainer: {
      padding: 20,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    monthYearText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    navigationButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 2,
    },
    calendarDayInRange: {
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.3)',
    },
    calendarDaySelected: {
      backgroundColor: isDark ? '#0A84FF' : '#007AFF',
    },
    calendarDayToday: {
      borderWidth: 2,
      borderColor: isDark ? '#FF453A' : '#FF3B30',
    },
    calendarDayText: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#1D1D1F',
      fontWeight: '500',
    },
    calendarDayTextInRange: {
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    calendarDayTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    calendarDayTextToday: {
      color: isDark ? '#FF453A' : '#FF3B30',
      fontWeight: '600',
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginHorizontal: 8,
      borderWidth: 1,
    },
    cancelButton: {
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    confirmButton: {
      backgroundColor: isDark ? '#0A84FF' : '#007AFF',
      borderColor: isDark ? '#0A84FF' : '#007AFF',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: isDark ? '#FFFFFF' : '#1D1D1F',
    },
    confirmButtonText: {
      color: '#FFFFFF',
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
              <Ionicons name="calendar-outline" size={24} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
              {' '}Seleccionar Rango de Fechas
            </Text>
            
            <View style={styles.dateRangeDisplay}>
              <Text style={styles.dateRangeText}>
                Desde: {formatDate(startDate)}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
              <Text style={styles.dateRangeText}>
                Hasta: {formatDate(endDate)}
              </Text>
            </View>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.navigationButton} onPress={handlePreviousMonth}>
                <Ionicons name="chevron-back" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>
                {currentMonth.toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              
              <TouchableOpacity style={styles.navigationButton} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#1D1D1F'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
              <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
