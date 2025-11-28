import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

// Hook para obtener estilos globales consistentes
export const useGlobalStyles = () => {
  const { isDark } = useTheme();
  const { responsiveSizes } = useResponsive();

  return StyleSheet.create({
    // Container base
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    containerSecondary: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    
    // Scroll content
    scrollContent: {
      padding: responsiveSizes.spacingLarge,
    },
    
    // Loading states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: responsiveSizes.spacingLarge,
    },
    loadingText: {
      fontSize: responsiveSizes.textLarge,
      color: isDark ? '#FFFFFF' : '#000000',
      marginTop: responsiveSizes.spacingMedium,
      textAlign: 'center',
    },
    
    // Section spacing
    section: {
      marginBottom: responsiveSizes.spacingXLarge,
    },
    sectionLast: {
      marginBottom: 0,
    },
    
    // Text styles
    title: {
      fontSize: responsiveSizes.textXLarge,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: responsiveSizes.textLarge,
      fontWeight: '400',
      color: isDark ? '#FFFFFF' : '#000000',
      letterSpacing: -0.2,
    },
    body: {
      fontSize: responsiveSizes.textMedium,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    caption: {
      fontSize: responsiveSizes.textSmall,
      color: isDark ? '#8E8E93' : '#6D6D70',
    },
    
    // Spacing utilities
    marginTop: {
      marginTop: responsiveSizes.spacingMedium,
    },
    marginBottom: {
      marginBottom: responsiveSizes.spacingMedium,
    },
    paddingHorizontal: {
      paddingHorizontal: responsiveSizes.spacingLarge,
    },
    paddingVertical: {
      paddingVertical: responsiveSizes.spacingMedium,
    },
    
    // Chart container styles - centralized
    chartContainer: {
      borderRadius: responsiveSizes.borderRadiusLarge,
      overflow: 'hidden',
      marginBottom: responsiveSizes.spacingLarge,
      // Liquid Glass effect - mejor contraste en modo oscuro
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)',
      // Shadow for depth
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
    chartContent: {
      padding: responsiveSizes.spacingLarge,
    },
    chartTitle: {
      fontSize: responsiveSizes.textXLarge,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: responsiveSizes.spacingMedium,
    },
    
    // Modal styles - centralized
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: responsiveSizes.borderRadiusLarge,
      borderTopRightRadius: responsiveSizes.borderRadiusLarge,
      maxHeight: '60%',
      minHeight: '40%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: responsiveSizes.spacingLarge,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
      fontSize: responsiveSizes.textXLarge,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    modalCloseButton: {
      padding: 4,
    },
    
    // Alert card styles - centralized
    alertCard: {
      borderRadius: responsiveSizes.borderRadiusLarge,
      overflow: 'hidden',
      marginBottom: responsiveSizes.spacingSmall,
      // Liquid Glass effect - mejor contraste en modo oscuro
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)',
      // Shadow for depth
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
    alertContent: {
      padding: responsiveSizes.spacingLarge,
    },
    alertTitle: {
      fontSize: responsiveSizes.textLarge,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      marginLeft: 8,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    alertMessage: {
      fontSize: responsiveSizes.textMedium,
      color: isDark ? '#FFFFFF' : '#000000',
      lineHeight: 20,
    },
    
    // Sensor selector styles - centralized
    sensorSelectorContainer: {
      alignItems: 'center',
      marginVertical: responsiveSizes.spacingMedium,
    },
    sensorSelectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      paddingHorizontal: responsiveSizes.spacingLarge,
      paddingVertical: responsiveSizes.spacingMedium,
      borderRadius: responsiveSizes.borderRadiusLarge,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      gap: 8,
    },
    sensorSelectorText: {
      fontSize: responsiveSizes.textLarge,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    sensorOption: {
      paddingHorizontal: responsiveSizes.spacingLarge,
      paddingVertical: responsiveSizes.spacingMedium,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    selectedSensorOption: {
      backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
    },
    sensorOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sensorOptionInfo: {
      flex: 1,
      marginLeft: responsiveSizes.spacingMedium,
    },
    sensorOptionLocation: {
      fontSize: responsiveSizes.textLarge,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    sensorOptionId: {
      fontSize: responsiveSizes.textMedium,
      color: isDark ? '#8E8E93' : '#6D6D70',
      marginTop: 2,
    },
  });
};

