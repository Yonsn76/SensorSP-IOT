/**
 * Liquid Glass Theme - Apple Design System
 * Solo colores blanco y negro con efecto Liquid Glass 100%
 * Centralizado para evitar duplicaciones
 */

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#000000',
    icon: '#000000',
    tabIconDefault: '#666666',
    tabIconSelected: '#000000',
    
    // Liquid Glass colors - Blanco puro
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassShadow: 'rgba(0, 0, 0, 0.12)',
    cardBackground: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    blurBackground: 'rgba(255, 255, 255, 0.8)',
    
    // Efectos Liquid Glass adicionales
    glassOverlay: 'rgba(255, 255, 255, 0.7)',
    glassHighlight: 'rgba(255, 255, 255, 0.95)',
    glassSubtle: 'rgba(0, 0, 0, 0.03)',
    
    // Modal colors
    modalBackground: 'rgba(255, 255, 255, 0.95)',
    modalBorder: 'rgba(0, 0, 0, 0.1)',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    
    // Button colors
    primaryButton: '#007AFF',
    secondaryButton: 'rgba(255, 255, 255, 0.8)',
    secondaryButtonBorder: 'rgba(0, 0, 0, 0.2)',
    dangerButton: '#FF3B30',
    
    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFFFF',
    icon: '#FFFFFF',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#FFFFFF',
    
    // Liquid Glass colors - Negro puro
    glass: 'rgba(0, 0, 0, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    cardBackground: 'rgba(0, 0, 0, 0.9)',
    cardBorder: 'rgba(255, 255, 255, 0.06)',
    blurBackground: 'rgba(0, 0, 0, 0.8)',
    
    // Efectos Liquid Glass adicionales
    glassOverlay: 'rgba(0, 0, 0, 0.7)',
    glassHighlight: 'rgba(0, 0, 0, 0.95)',
    glassSubtle: 'rgba(255, 255, 255, 0.03)',
    
    // Modal colors
    modalBackground: 'rgba(28, 28, 30, 0.95)',
    modalBorder: 'rgba(255, 255, 255, 0.1)',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    
    // Button colors
    primaryButton: '#0A84FF',
    secondaryButton: 'rgba(28, 28, 30, 0.8)',
    secondaryButtonBorder: 'rgba(255, 255, 255, 0.2)',
    dangerButton: '#FF3B30',
    
    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',
  },
};

// Helper function to get theme-aware colors
export const getThemeColors = (isDark: boolean) => {
  return isDark ? Colors.dark : Colors.light;
};
