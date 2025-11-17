import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from './useResponsive';

/**
 * Hook para obtener la altura del tab bar y el padding necesario para el contenido
 * Esto asegura que el contenido no quede detrás del tab bar
 */
export const useTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  const { responsiveSizes, isSmallScreen } = useResponsive();
  
  // Calcular la altura del tab bar manualmente
  // Esto coincide con el cálculo en app/(tabs)/_layout.tsx
  const minBottomPaddingAndroid = 20;
  const basePadding = responsiveSizes.spacingSmall;
  const safeAreaBottomPadding = Platform.OS === 'android' 
    ? Math.max(insets.bottom, minBottomPaddingAndroid) + basePadding
    : Math.max(insets.bottom, 0) + basePadding;
  
  const baseContentHeight = isSmallScreen ? 40 : 44;
  const tabBarHeight = baseContentHeight + responsiveSizes.spacingSmall + safeAreaBottomPadding;
  
  // Padding adicional para asegurar que el contenido no quede justo detrás del tab bar
  // Agregamos un poco más de espacio para que haya una separación visual clara
  const contentPaddingBottom = tabBarHeight + responsiveSizes.spacingMedium;
  
  return {
    tabBarHeight,
    contentPaddingBottom,
    safeAreaBottom: insets.bottom,
  };
};

