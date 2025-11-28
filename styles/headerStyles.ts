import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

// Hook para obtener estilos de header consistentes
export const useHeaderStyles = () => {
  const { isDark } = useTheme();
  const { responsiveSizes } = useResponsive();

  return StyleSheet.create({
    header: {
      padding: responsiveSizes.spacingLarge,
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
      paddingHorizontal: responsiveSizes.spacingLarge,
      paddingVertical: responsiveSizes.spacingMedium,
    },
    headerIconContainer: {
      width: responsiveSizes.iconLarge + 16,
      height: responsiveSizes.iconLarge + 16,
      borderRadius: (responsiveSizes.iconLarge + 16) / 2,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveSizes.spacingMedium,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
      fontSize: responsiveSizes.textXLarge,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      letterSpacing: -0.2,
    },
    headerSubtitle: {
      fontSize: responsiveSizes.textLarge,
      fontWeight: '400',
      color: isDark ? '#FFFFFF' : '#000000',
      flex: 1,
      letterSpacing: -0.2,
    },
    // Estilos para botones en header
    headerButton: {
      position: 'absolute',
      bottom: 8,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      paddingHorizontal: responsiveSizes.spacingMedium,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      gap: 6,
    },
    headerButtonText: {
      fontSize: responsiveSizes.textMedium,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#000000',
    },
  });
};


