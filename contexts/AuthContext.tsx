import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestored: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestored: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION_RESTORED'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('🔄 AuthReducer - Action:', action.type, 'Current state:', state);
  
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isSessionRestored: false,
      };
    case 'LOGIN_ERROR':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isSessionRestored: false,
      };
    case 'LOGOUT':
      console.log('🔄 AuthReducer - LOGOUT action processed');
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isSessionRestored: false,
      };
    case 'RESTORE_SESSION':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isSessionRestored: true,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_SESSION_RESTORED':
      return {
        ...state,
        isSessionRestored: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSessionRestored: false,
};

// API Base URL
const API_BASE_URL = 'https://iotapi.up.railway.app/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored session on app start
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('sensorsp-user');
        if (storedUser) {
          const authData = JSON.parse(storedUser);
          // Si hay datos de autenticación guardados, restaurar la sesión
          if (authData.user) {
            console.log('🔍 Restaurando sesión desde almacenamiento');
            dispatch({ type: 'RESTORE_SESSION', payload: authData.user });
          } else {
            console.log('🔍 No hay datos de usuario válidos');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          console.log('🔍 No hay sesión guardada');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.log('Error restoring session:', error);
        await AsyncStorage.removeItem('sensorsp-user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('🔄 Intentando login con API...');
      
      // Login con el endpoint correcto
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: credentials.email,
        password: credentials.password,
      }, {
        timeout: 10000,
      });

      console.log('📡 Respuesta de la API:', response.data);

      if (response.data) {
        let userData = null;
        
        // Intentar diferentes estructuras de respuesta
        if (response.data.user) {
          userData = response.data.user;
        } else if (response.data.data) {
          userData = response.data.data;
        } else if (response.data.id || response.data.username) {
          userData = response.data;
        }
        
        if (userData) {
          const user: User = {
            id: userData._id || userData.id || '1',
            username: userData.username || userData.email?.split('@')[0] || 'usuario',
            email: userData.email || credentials.email,
            role: userData.role || 'user',
            createdAt: userData.createdAt || new Date().toISOString(),
          };

          // Guardar también el token JWT si está disponible
          const authData = {
            user,
            token: response.data.token || null,
            message: response.data.message || 'Login exitoso'
          };

          await AsyncStorage.setItem('sensorsp-user', JSON.stringify(authData));
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          console.log('   Login exitoso con API');
        } else {
          throw new Error('Estructura de respuesta no reconocida');
        }
      } else {
        throw new Error('Respuesta vacía del servidor');
      }
    } catch (apiError) {
      console.log('  Error en API:', apiError);
      dispatch({ type: 'LOGIN_ERROR' });
      
      // Determinar el mensaje de error específico
      if (axios.isAxiosError(apiError)) {
        if (apiError.response?.status === 400) {
          throw new Error('Datos incompletos. Verifica tu email y contraseña');
        } else if (apiError.response?.status === 401) {
          throw new Error('Credenciales inválidas o cuenta inactiva');
        } else if (apiError.response?.status === 500) {
          throw new Error('Error interno del servidor. Intenta nuevamente');
        } else if (apiError.code === 'ECONNABORTED') {
          throw new Error('Tiempo de conexión agotado. Verifica tu conexión a internet');
        } else if (apiError.code === 'NETWORK_ERROR') {
          throw new Error('Error de conexión. Verifica tu conexión a internet');
        } else {
          throw new Error(`Error del servidor (${apiError.response?.status}). Intenta nuevamente`);
        }
      } else {
        throw new Error('Error de conexión. Verifica tu conexión a internet');
      }
    }
  };

    const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Iniciando logout...');
      
      // Limpiar el almacenamiento primero
      await AsyncStorage.removeItem('sensorsp-user');
      console.log('   Datos de sesión eliminados del almacenamiento');
      
      // Luego actualizar el estado
      dispatch({ type: 'LOGOUT' });
      console.log('   Estado de autenticación actualizado - isAuthenticated: false');
      
      console.log('   Logout completado exitosamente');
    } catch (error) {
      console.error('  Error durante logout:', error);
      // Aún así, asegurar que el estado esté limpio
      dispatch({ type: 'LOGOUT' });
      console.log('   Estado limpiado a pesar del error');
    }
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isSessionRestored: state.isSessionRestored,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
