import { registerWidgetConfigurationScreen, registerWidgetTaskHandler } from 'react-native-android-widget';
import { WidgetConfigScreen } from './widgets/native/WidgetConfigScreen';
import { widgetTaskHandler } from './widgets/native/WidgetTaskHandler';

// Register the widget task handler for background updates
// This must be done before the app loads
registerWidgetTaskHandler(widgetTaskHandler);

// Register the widget configuration screen for all widgets
// This enables the configuration activity when adding a new widget
// and allows reconfiguration from widget long-press (Requirements 4.1, 4.3)
registerWidgetConfigurationScreen(WidgetConfigScreen);

// Import the Expo Router entry point
import 'expo-router/entry';
