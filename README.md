# SensorSP - Sistema IoT de Detección de Temperatura

Proyecto completo de IoT para la detección y monitoreo de temperatura mediante un sensor DHT11 conectado a un ESP32, con una aplicación móvil desarrollada en React Native y una API RESTful para la gestión de datos.

## 📁 Estructura del Proyecto

```
IOT APP-MOVIL/
├── SensorSP/          # Firmware del ESP32 para simulación en Wokwi
├── api-iot/          # API RESTful con Node.js y MongoDB
├── app-iot/          # Aplicación móvil con React Native y Expo

```

## 🚀 Componentes del Sistema

### 📋 SensorSP/
Código de simulación para el ESP32 con sensor DHT11, diseñado para funcionar en la plataforma Wokwi. Este componente:
- Lee datos de temperatura y humedad del sensor DHT11
- Envía los datos a la API mediante peticiones HTTP
- Incluye configuración para PlatformIO
- Simula el comportamiento real del hardware en entorno virtual

**Tecnologías:**
- PlatformIO
- Framework Arduino
- ESP32
- Sensor DHT11
- ArduinoJson

### 🔌 api-iot/
API RESTful que sirve como backend para el sistema IoT. Proporciona:
- Endpoints para recibir datos de sensores
- Gestión de usuarios y autenticación
- Almacenamiento de datos en MongoDB
- Sistema de notificaciones
- Preferencias de usuario personalizadas

**Tecnologías:**
- Node.js
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- bcrypt para encriptación

### 📱 app-iot/
Aplicación móvil multiplataforma desarrollada con React Native y Expo que permite:
- Visualización en tiempo real de datos de temperatura y humedad
- Gráficos históricos de sensores
- Gestión de notificaciones y alertas
- Configuración de preferencias de usuario
- Interfaz moderna e intuitiva

**Tecnologías:**
- React Native con Expo
- TypeScript
- Expo Router para navegación
- React Native Chart Kit para gráficos
- Axios para comunicaciones API

## 🛠️ Requisitos Previos

### Para el Firmware (SensorSP)
- PlatformIO IDE
- Cuenta en Wokwi (para simulación)

### Para la API (api-iot)
- Node.js (v14 o superior)
- MongoDB
- npm o yarn

### Para la App Móvil (app-iot)
- Node.js (v18 o superior)
- Expo CLI
- dispositivo Android/iOS o emulador

## 📦 Instalación y Configuración

### 1. Configurar la API
```bash
cd api-iot
npm install
cp config.env.example config.env
# Editar config.env con tus credenciales de MongoDB
npm run dev
```

### 2. Configurar la Aplicación Móvil
```bash
cd app-iot
npm install
# Configurar la URL de la API en el archivo de configuración
npx expo start
```

### 3. Simular el ESP32 en Wokwi
- Abre el proyecto SensorSP en Wokwi
- Configura el diagrama con ESP32 y DHT11
- Carga el firmware generado por PlatformIO

## 🔧 Funcionalidades Principales

### 🌡️ Monitoreo de Sensores
- Lectura continua de temperatura y humedad
- Visualización en tiempo real
- Histórico de datos con gráficos

### 👥 Gestión de Usuarios
- Registro y autenticación
- Perfiles personalizados
- Configuración de preferencias

### 🔔 Sistema de Alertas
- Notificaciones push
- Alertas por umbrales de temperatura
- Configuración personalizable

### 📊 Análisis de Datos
- Gráficos interactivos
- Exportación de datos
- Tendencias históricas

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐    HTTP     ┌─────────────┐    HTTP     ┌─────────────┐
│   ESP32     │ ──────────► │   API IoT   │ ──────────► │   App Móvil │
│  + DHT11    │             │  (Node.js)  │             │ (React Native)│
└─────────────┘             └─────────────┘             └─────────────┘
                                      │
                                      ▼
                             ┌─────────────┐
                             │   MongoDB   │
                             │  Database   │
                             └─────────────┘
```

## 🚀 Despliegue

### API en Producción
- Configurar variables de entorno
- Implementar en servidor (Heroku, Vercel, etc.)
- Configurar MongoDB Atlas

### App Móvil en Producción
- Generar APK con EAS Build
- Publicar en Google Play Store
- Configurar notificaciones push

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama de características (`git checkout -b feature/NuevaCaracteristica`)
3. Commit de cambios (`git commit -m 'Agregando nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](app-iot/LICENSE) para detalles.


**Nota:** El componente SensorSP está diseñado específicamente para simulación en Wokwi, permitiendo probar el sistema completo sin necesidad de hardware físico.
