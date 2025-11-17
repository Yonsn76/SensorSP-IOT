import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Haptic feedback para Android
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
