import React from 'react';
import { Modal, StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { LiquidGlassCard } from '../cards';

interface LiquidGlassModalProps extends ViewProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'fade' | 'slide' | 'none';
  maxHeight?: string;
}

export const LiquidGlassModal: React.FC<LiquidGlassModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'fade',
  maxHeight = '85%',
  style,
  ...props
}) => {
  const { isDark } = useTheme();

  const modalStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: maxHeight as any,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <LiquidGlassCard
          variant="modal"
          useBlur={false}
          style={[modalStyles.modalContent, style] as any}
          {...props}
        >
          {children}
        </LiquidGlassCard>
      </View>
    </Modal>
  );
};

export default LiquidGlassModal;
