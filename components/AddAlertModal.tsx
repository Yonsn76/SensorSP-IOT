import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getThemeColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationRule } from '../services/notificationService';
import LiquidGlassButton from './ui/LiquidGlassButton';
import LiquidGlassModal from './ui/LiquidGlassModal';

interface AddAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAlert: (rule: NotificationRule) => void;
}

export default function AddAlertModal({ visible, onClose, onAddAlert }: AddAlertModalProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  
  const [alertName, setAlertName] = useState('');
  const [alertType, setAlertType] = useState<'temperature' | 'humidity' | 'actuator' | 'status'>('temperature');
  const [condition, setCondition] = useState<'mayor_que' | 'menor_que' | 'igual_a' | 'cambia_a'>('mayor_que');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

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

  const handleAddAlert = () => {
    if (!alertName.trim() || !value.trim() || !message.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
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
       priority: 'normal',
       sound: 'default',
       vibration: true,
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
      flexDirection: 'row',
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
    },
    label: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
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
          fullWidth
        />
        <LiquidGlassButton
          title="Agregar Alerta"
          onPress={handleAddAlert}
          variant="primary"
          icon="add-circle-outline"
          fullWidth
        />
      </View>
    </LiquidGlassModal>
  );
}
