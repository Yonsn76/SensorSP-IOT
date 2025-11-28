import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

interface ScrollableChartProps {
  children: React.ReactNode;
  minWidth?: number;
  chartWidth?: number;
  dataLength?: number;
  maxVisiblePoints?: number;
}

export default function ScrollableChart({ 
  children, 
  minWidth = screenWidth - 80,
  chartWidth,
  dataLength = 0,
  maxVisiblePoints = 8
}: ScrollableChartProps) {
  const { isDark } = useTheme();
  const [contentWidth, setContentWidth] = useState(minWidth);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calcular el ancho necesario basado en la cantidad de datos
  const calculateRequiredWidth = () => {
    if (chartWidth) {
      return chartWidth;
    }
    
    // Siempre asegurar un ancho mínimo para scroll
    const baseWidth = Math.max(minWidth, screenWidth - 80);
    
    if (dataLength > maxVisiblePoints) {
      // Si hay más datos que puntos visibles, expandir el ancho
      const pointsPerScreen = maxVisiblePoints;
      const totalPoints = dataLength;
      const expansionFactor = Math.ceil(totalPoints / pointsPerScreen);
      return baseWidth * expansionFactor;
    }
    
    // Para pocos datos, usar un ancho que permita scroll suave
    if (dataLength > 1) {
      return baseWidth * 1.2; // 20% más ancho para permitir scroll mínimo
    }
    
    return baseWidth;
  };

  const requiredWidth = calculateRequiredWidth();
  const needsScroll = dataLength > 1; // Mostrar scroll si hay más de 1 punto de datos

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    setContentWidth(Math.max(contentWidth, requiredWidth));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
    scrollIndicatorText: {
      fontSize: 10,
      color: isDark ? '#FFFFFF' : '#000000',
      marginLeft: 4,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {needsScroll && (
        <View style={styles.scrollIndicator}>
          <Ionicons 
            name="swap-horizontal-outline" 
            size={12} 
            color={isDark ? '#FFFFFF' : '#000000'} 
          />
          <Text style={styles.scrollIndicatorText}>
            Desliza →
          </Text>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        horizontal={needsScroll}
        showsHorizontalScrollIndicator={needsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { width: needsScroll ? requiredWidth : '100%' }
        ]}
        onContentSizeChange={handleContentSizeChange}
        scrollEnabled={needsScroll}
        bounces={true}
        decelerationRate="normal"
        style={styles.scrollView}
        pagingEnabled={false}
        snapToInterval={needsScroll ? 50 : undefined}
        snapToAlignment="start"
      >
        <View style={[styles.chartWrapper, { width: needsScroll ? requiredWidth : '100%' }]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
