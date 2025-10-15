# Estructura de Componentes UI

```
components/
├── auth/                          # 🔐 Autenticación
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ProtectedRoute.tsx
│   └── index.ts
│
├── ui/                           # 🎨 Interfaz de Usuario
│   ├── forms/                    # 📝 Formularios
│   │   ├── AnimatedForm.tsx
│   │   ├── AnimatedLoginForm.tsx
│   │   └── index.ts
│   │
│   ├── cards/                    # 🃏 Tarjetas
│   │   ├── Card.tsx
│   │   ├── StatCard.tsx
│   │   ├── LiquidGlassCard.tsx
│   │   └── index.ts
│   │
│   ├── buttons/                  # 🔘 Botones
│   │   ├── Button.tsx
│   │   ├── LiquidGlassButton.tsx
│   │   └── index.ts
│   │
│   ├── modals/                   # 🪟 Modales
│   │   ├── LiquidGlassModal.tsx
│   │   ├── AddAlertModal.tsx
│   │   ├── ExportModal.tsx
│   │   ├── AdvancedExportModal.tsx
│   │   └── index.ts
│   │
│   ├── inputs/                   # 🎛️ Entradas
│   │   ├── CustomDateRangeSelector.tsx
│   │   ├── TimeRangeSelector.tsx
│   │   └── index.ts
│   │
│   ├── common/                   # 🔧 Comunes
│   │   ├── Screen.tsx
│   │   ├── Header.tsx
│   │   ├── ListItem.tsx
│   │   ├── TabBarBackground.tsx
│   │   └── index.ts
│   │
│   └── index.ts                  # 📦 Exportaciones UI
│
├── HapticTab.tsx                 # 🔄 Componentes individuales
├── TabBarIcon.tsx
├── ThemedText.tsx
├── ThemedView.tsx
├── LoadingScreen.tsx
├── ScrollableChart.tsx
├── index.ts                      # 📦 Exportaciones principales
├── README.md                     # 📖 Documentación
└── STRUCTURE.md                  # 📊 Estructura visual
```

## 🎯 Categorías de Componentes

### 🔐 **Auth** - Autenticación
Componentes relacionados con el sistema de autenticación y autorización.

### 📝 **Forms** - Formularios
Componentes para la captura y validación de datos del usuario.

### 🃏 **Cards** - Tarjetas
Componentes para mostrar información en formato de tarjeta.

### 🔘 **Buttons** - Botones
Componentes interactivos para acciones del usuario.

### 🪟 **Modals** - Modales
Componentes de ventanas emergentes y diálogos.

### 🎛️ **Inputs** - Entradas
Componentes especializados para la entrada de datos.

### 🔧 **Common** - Comunes
Componentes base y reutilizables en toda la aplicación.
