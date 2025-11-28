import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { mobileOptimization, getResponsiveConfig } from '../config/mobileOptimization';

export const useResponsive = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  
  // Usar configuración responsive
  const responsiveConfig = getResponsiveConfig(width);
  const { isSmallScreen, isMediumScreen, isLargeScreen, scaleFactor, iconScale, textScale } = responsiveConfig;
  
  // Tamaños responsive
  const responsiveSizes = {
    // Iconos
    iconSmall: Math.round(16 * iconScale),
    iconMedium: Math.round(20 * iconScale),
    iconLarge: Math.round(24 * iconScale),
    
    // Texto
    textSmall: Math.round(12 * textScale),
    textMedium: Math.round(14 * textScale),
    textLarge: Math.round(16 * textScale),
    textXLarge: Math.round(18 * textScale),
    
    // Espaciado
    spacingSmall: Math.round(8 * scaleFactor),
    spacingMedium: Math.round(12 * scaleFactor),
    spacingLarge: Math.round(16 * scaleFactor),
    spacingXLarge: Math.round(20 * scaleFactor),
    
    // Bordes
    borderRadiusSmall: Math.round(8 * scaleFactor),
    borderRadiusMedium: Math.round(12 * scaleFactor),
    borderRadiusLarge: Math.round(16 * scaleFactor),
    
    // Sombras optimizadas para móvil
    shadowOffset: mobileOptimization.shadows.light.shadowOffset,
    shadowRadius: mobileOptimization.shadows.light.shadowRadius,
    shadowOpacity: mobileOptimization.shadows.light.shadowOpacity,
  };

  return {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    scaleFactor,
    iconScale,
    textScale,
    responsiveSizes,
    mobileOptimization,
  };
};
