// Configuración de optimización para móvil
export const mobileOptimization = {
  // Configuración de sombras optimizada para móvil
  shadows: {
    light: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    heavy: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
  },

  // Configuración de blur optimizada para móvil
  blur: {
    light: 20,
    medium: 30,
    heavy: 40,
  },

  // Configuración de escalas optimizada para móvil
  scales: {
    subtle: 1.005,
    light: 1.01,
    medium: 1.02,
    heavy: 1.05,
  },

  // Configuración de opacidades optimizada para móvil
  opacity: {
    disabled: 0.3,
    inactive: 0.6,
    active: 1,
  },

  // Configuración de bordes optimizada para móvil
  borders: {
    light: 0.5,
    medium: 1,
    heavy: 1.5,
  },
};

// Función para obtener configuración responsive
export const getResponsiveConfig = (screenWidth: number) => {
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414;

  return {
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    scaleFactor: isSmallScreen ? 0.85 : isMediumScreen ? 0.95 : 1,
    iconScale: isSmallScreen ? 0.9 : isMediumScreen ? 0.95 : 1,
    textScale: isSmallScreen ? 0.9 : isMediumScreen ? 0.95 : 1,
  };
};


