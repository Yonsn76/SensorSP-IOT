// Configuración específica para Android
export const AndroidConfig = {
  // Configuración de notificaciones
  notification: {
    channelId: 'iot-notifications',
    channelName: 'IoT Notificaciones',
    channelDescription: 'Notificaciones del sistema IoT',
    importance: 'high',
    sound: 'default',
  },
  
  // Configuración de haptic feedback
  haptic: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
  },
  
  // Configuración de navegación
  navigation: {
    tabBarHeight: 60,
    headerHeight: 56,
  },
  
  // Configuración de colores específicos de Android
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#1D1D1F',
    textSecondary: '#6D6D70',
  },
  
  // Configuración de estilos
  styles: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

