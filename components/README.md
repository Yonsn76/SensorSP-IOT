# Componentes UI - Estructura Organizada

Esta carpeta contiene todos los componentes de la interfaz de usuario organizados por categorías para facilitar el mantenimiento y la navegación.

## 📁 Estructura de Carpetas

### 🔐 `/auth` - Componentes de Autenticación
- `LoginScreen.tsx` - Pantalla de inicio de sesión
- `RegisterScreen.tsx` - Pantalla de registro
- `ProtectedRoute.tsx` - Componente para rutas protegidas
- `index.ts` - Exportaciones de autenticación

### 🎨 `/ui` - Componentes de Interfaz de Usuario

#### 📝 `/ui/forms` - Formularios
- `AnimatedForm.tsx` - Formulario animado genérico
- `AnimatedLoginForm.tsx` - Formulario de login con círculo animado
- `index.ts` - Exportaciones de formularios

#### 🃏 `/ui/cards` - Tarjetas
- `Card.tsx` - Tarjeta base con efectos de blur
- `StatCard.tsx` - Tarjeta para mostrar estadísticas
- `LiquidGlassCard.tsx` - Tarjeta con efecto de cristal líquido
- `index.ts` - Exportaciones de tarjetas

#### 🔘 `/ui/buttons` - Botones
- `Button.tsx` - Botón base reutilizable
- `LiquidGlassButton.tsx` - Botón con efecto de cristal líquido
- `index.ts` - Exportaciones de botones

#### 🪟 `/ui/modals` - Modales
- `LiquidGlassModal.tsx` - Modal base con efecto de cristal líquido
- `AddAlertModal.tsx` - Modal para agregar alertas
- `ExportModal.tsx` - Modal para exportar datos
- `AdvancedExportModal.tsx` - Modal avanzado de exportación
- `index.ts` - Exportaciones de modales

#### 🎛️ `/ui/inputs` - Componentes de Entrada
- `CustomDateRangeSelector.tsx` - Selector de rango de fechas personalizado
- `TimeRangeSelector.tsx` - Selector de rango de tiempo
- `index.ts` - Exportaciones de inputs

#### 🔧 `/ui/common` - Componentes Comunes
- `Screen.tsx` - Componente de pantalla base
- `Header.tsx` - Componente de encabezado
- `ListItem.tsx` - Componente de elemento de lista
- `TabBarBackground.tsx` - Fondo de la barra de pestañas
- `index.ts` - Exportaciones comunes

## 📦 Uso de Importaciones

### Importación por Categoría
```typescript
// Importar todos los componentes de autenticación
import { LoginScreen, RegisterScreen, ProtectedRoute } from '../components/auth';

// Importar todos los componentes de formularios
import { AnimatedForm, AnimatedLoginForm } from '../components/ui/forms';

// Importar todos los componentes de tarjetas
import { Card, StatCard, LiquidGlassCard } from '../components/ui/cards';
```

### Importación Individual
```typescript
// Importar componentes específicos
import { LoginScreen } from '../components/auth/LoginScreen';
import { AnimatedLoginForm } from '../components/ui/forms/AnimatedLoginForm';
```

### Importación desde el Índice Principal
```typescript
// Importar desde el índice principal (recomendado)
import { LoginScreen, AnimatedLoginForm, Card } from '../components';
```

## 🎯 Beneficios de esta Estructura

1. **Organización Clara**: Cada tipo de componente tiene su propia carpeta
2. **Fácil Navegación**: Los desarrolladores pueden encontrar componentes rápidamente
3. **Mantenimiento Simplificado**: Los cambios se localizan en carpetas específicas
4. **Escalabilidad**: Fácil agregar nuevos componentes en las categorías apropiadas
5. **Importaciones Limpias**: Múltiples opciones de importación según las necesidades

## 📋 Convenciones

- Cada carpeta tiene su propio `index.ts` para exportaciones
- Los nombres de archivos siguen PascalCase
- Los componentes están organizados por funcionalidad
- Las importaciones se hacen preferiblemente desde los índices de categoría

