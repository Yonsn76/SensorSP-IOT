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
    
    if (dataLength > maxVisiblePoints) {
      // Si hay más datos que puntos visibles, expandir el ancho
      const pointsPerScreen = maxVisiblePoints;
      const totalPoints = dataLength;
      const expansionFactor = Math.ceil(totalPoints / pointsPerScreen);
      return minWidth * expansionFactor;
    }
    
    return minWidth;
  };

  const requiredWidth = calculateRequiredWidth();
  const needsScroll = requiredWidth > screenWidth - 40; // Margen para el contenedor

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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 10,
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
            Desliza para ver más
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
        bounces={false}
        decelerationRate="fast"
        style={styles.scrollView}
      >
        <View style={[styles.chartWrapper, { width: needsScroll ? requiredWidth : '100%' }]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
