# SensorSP - IoT Monitoring App 📱🌡️

Aplicación móvil para monitoreo de sensores IoT de temperatura y humedad en tiempo real.

## 🚀 Características

- **Dashboard en tiempo real** - Visualiza temperatura y humedad de tus sensores
- **Widgets nativos Android** - Monitorea desde tu pantalla de inicio (2x2, 4x2, 4x4)
- **Alertas personalizadas** - Recibe notificaciones cuando los valores excedan límites
- **Historial de datos** - Gráficos y exportación de datos históricos
- **Modo offline** - Accede a datos cacheados sin conexión
- **Tema claro/oscuro** - Interfaz adaptable a tus preferencias

## 📋 Requisitos

- Node.js 18+
- Expo CLI
- Android Studio (para desarrollo Android)

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/Yonsn76/SensorSP-IOT.git
cd SensorSP-IOT

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

## 📱 Ejecutar en dispositivo

```bash
# Android
npm run android

# Web
npm run web
```

## 🧪 Tests

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 🏗️ Build

```bash
# APK para testing
npm run build:apk

# Build de producción
npm run build:android
```

## 📁 Estructura del proyecto

```
├── app/                 # Pantallas (Expo Router)
│   └── (tabs)/          # Navegación por tabs
├── components/          # Componentes reutilizables
│   ├── auth/            # Autenticación
│   └── ui/              # UI components
├── services/            # APIs y servicios
├── widgets/             # Widgets nativos Android
│   └── native/          # Implementación nativa
├── contexts/            # React Contexts
├── hooks/               # Custom hooks
└── constants/           # Constantes y configuración
```

## 🔧 Tecnologías

- **React Native** + **Expo** - Framework móvil
- **TypeScript** - Tipado estático
- **Expo Router** - Navegación
- **react-native-android-widget** - Widgets nativos
- **AsyncStorage** - Almacenamiento local
- **Jest + fast-check** - Testing

## 📄 Licencia

MIT License
