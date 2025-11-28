import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface TabBarIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  size?: number;
}

// Número de tabs en la navegación
const TAB_COUNT = 6;

export const TabBarIcon: React.FC<TabBarIconProps> = ({ 
  iconName, 
  color, 
  focused,
  size 
}) => {
  const { width, responsiveSizes } = useResponsive();
  
  // Calcular tamaño del icono basado en el ancho de pantalla y número de tabs
  // Dejamos espacio para padding, texto del label, y márgenes
  const calculateIconSize = () => {
    if (size) return size; // Si se proporciona un tamaño, usarlo
    
    // Ancho disponible por tab (considerando padding del tab bar)
    const tabBarPadding = 16; // padding horizontal del tab bar (8px cada lado)
    const availableWidth = width - (tabBarPadding * 2);
    const tabWidth = availableWidth / TAB_COUNT;
    
    // El icono debe ser más pequeño que el ancho del tab
    // Dejamos espacio para el texto del label abajo y padding del contenedor
    // Usamos solo 50% del ancho del tab para el contenedor del icono
    const iconContainerMaxWidth = tabWidth * 0.5; // 50% del ancho para el icono
    const iconPadding = 4; // padding interno del contenedor (mínimo)
    const maxIconSizeFromWidth = iconContainerMaxWidth - (iconPadding * 2);
    
    // Tamaño base responsive basado en el tamaño de pantalla (más conservador)
    let baseSize: number;
    
    if (width < 340) {
      // Pantallas muy pequeñas (< 340px) - iPhone SE, etc.
      baseSize = 14;
    } else if (width < 360) {
      // Pantallas pequeñas (340-360px)
      baseSize = 15;
    } else if (width < 375) {
      // Pantallas pequeñas (360-375px) - iPhone 8, etc.
      baseSize = 16;
    } else if (width < 390) {
      // Pantallas medianas pequeñas (375-390px) - iPhone X, 11, etc.
      baseSize = 17;
    } else if (width < 414) {
      // Pantallas medianas (390-414px)
      baseSize = 18;
    } else if (width < 430) {
      // Pantallas grandes (414-430px) - iPhone 14 Pro Max, etc.
      baseSize = 19;
    } else {
      // Pantallas muy grandes (>= 430px) - Tablets, etc.
      baseSize = 20;
    }
    
    // Asegurar que no exceda el máximo disponible basado en el ancho
    // Y usar el mínimo entre el tamaño base y el máximo disponible
    const finalSize = Math.min(baseSize, maxIconSizeFromWidth);
    
    // Asegurar un tamaño mínimo de 14px para que siempre sea visible
    return Math.max(14, Math.min(finalSize, 20));
  };
  
  const iconSize = calculateIconSize();
  
  // Calcular tamaño del contenedor basado en el tamaño del icono
  // El contenedor debe ser ligeramente más grande que el icono para tener padding
  const containerPadding = 4; // padding mínimo alrededor del icono
  const containerSize = iconSize + (containerPadding * 2);
  const containerHeight = Math.min(containerSize, 26); // Máximo 26px de altura para mantener compacto
  
  // Convertir el nombre del icono para mostrar filled cuando está activo
  const getIconName = (name: string, isFocused: boolean) => {
    if (isFocused) {
      // Si está activo, usar la versión filled
      return name.replace('-outline', '') as keyof typeof Ionicons.glyphMap;
    }
    // Si está inactivo, usar la versión outline
    return name as keyof typeof Ionicons.glyphMap;
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      width: containerSize,
      height: containerHeight,
      minWidth: containerSize,
      maxWidth: containerSize,
      minHeight: containerHeight,
      maxHeight: containerHeight,
      borderRadius: responsiveSizes.borderRadiusSmall,
      backgroundColor: focused ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
      shadowColor: focused ? '#007AFF' : 'transparent',
      shadowOffset: responsiveSizes.shadowOffset,
      shadowOpacity: focused ? 0.2 : 0,
      shadowRadius: responsiveSizes.shadowRadius,
      elevation: focused ? 3 : 0,
      borderWidth: focused ? 1 : 0,
      borderColor: focused ? 'rgba(0, 122, 255, 0.4)' : 'transparent',
      overflow: 'hidden', // Asegurar que el icono no se salga
    },
    icon: {
      opacity: focused ? 1 : 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons 
        name={getIconName(iconName, focused)} 
        size={iconSize} 
        color={color} 
        style={styles.icon}
      />
    </View>
  );
};
