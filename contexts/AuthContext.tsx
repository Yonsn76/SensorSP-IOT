import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
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
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_ERROR' }
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
    case 'REGISTER_START':
      return { ...state, isLoading: true };
    case 'REGISTER_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isSessionRestored: false,
      };
    case 'REGISTER_ERROR':
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
            // Incluir el token en el usuario si está disponible
            const userWithToken = {
              ...authData.user,
              token: authData.token || null
            };
            dispatch({ type: 'RESTORE_SESSION', payload: userWithToken });
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
        timeout: API_TIMEOUT,
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
            createdAt: userData.createdAt || new Date().toISOString(),
            token: response.data.token || null,
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

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      console.log('🔄 Intentando registro con API...');
      console.log('📤 Datos enviados:', {
        username: credentials.username,
        email: credentials.email,
        password: '***' // No mostrar la contraseña en logs
      });
      console.log('🌐 URL:', `${API_BASE_URL}/users/register`);
      
      // Registro con el endpoint correcto
      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      }, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta de la API:', response.data);
      console.log('📊 Status:', response.status);

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
            username: userData.username || credentials.username,
            email: userData.email || credentials.email,
            createdAt: userData.createdAt || new Date().toISOString(),
            token: response.data.token || null,
          };

          // Guardar también el token JWT si está disponible
          const authData = {
            user,
            token: response.data.token || null,
            message: response.data.message || 'Registro exitoso'
          };

          await AsyncStorage.setItem('sensorsp-user', JSON.stringify(authData));
          dispatch({ type: 'REGISTER_SUCCESS', payload: user });
          console.log('   Registro exitoso con API');
        } else {
          throw new Error('Estructura de respuesta no reconocida');
        }
      } else {
        throw new Error('Respuesta vacía del servidor');
      }
    } catch (apiError) {
      console.log('  Error en API:', apiError);
      dispatch({ type: 'REGISTER_ERROR' });
      
      // Determinar el mensaje de error específico
      if (axios.isAxiosError(apiError)) {
        // Log detallado del error
        console.log('  Status:', apiError.response?.status);
        console.log('  Status Text:', apiError.response?.statusText);
        console.log('  Error Data:', apiError.response?.data);
        console.log('  Error Headers:', apiError.response?.headers);
        console.log('  Request URL:', apiError.config?.url);
        console.log('  Request Method:', apiError.config?.method);
        console.log('  Request Data:', apiError.config?.data);
        
        if (apiError.response?.status === 400) {
          const errorMessage = apiError.response.data?.message || apiError.response.data?.error || 'Datos incompletos o inválidos';
          console.error('❌ Error 400:', errorMessage);
          throw new Error(errorMessage);
        } else if (apiError.response?.status === 409) {
          const errorMessage = apiError.response.data?.message || 'El email o nombre de usuario ya está registrado';
          console.error('❌ Error 409:', errorMessage);
          throw new Error(errorMessage);
        } else if (apiError.response?.status === 500) {
          const errorMessage = apiError.response.data?.message || apiError.response.data?.error || 'Error interno del servidor';
          console.error('❌ Error 500:', errorMessage);
          console.error('❌ Detalles del error:', JSON.stringify(apiError.response.data, null, 2));
          throw new Error(`Error del servidor: ${errorMessage}. Verifica que todos los campos sean válidos.`);
        } else if (apiError.code === 'ECONNABORTED') {
          console.error('❌ Timeout:', 'La conexión tardó demasiado');
          throw new Error('Tiempo de conexión agotado. Verifica tu conexión a internet');
        } else if (apiError.code === 'NETWORK_ERROR' || !apiError.response) {
          console.error('❌ Network Error:', apiError.message);
          throw new Error('Error de conexión. Verifica tu conexión a internet y que la API esté disponible');
        } else {
          const status = apiError.response?.status || 'desconocido';
          const errorMessage = apiError.response?.data?.message || apiError.response?.data?.error || `Error del servidor (${status})`;
          console.error(`❌ Error ${status}:`, errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        console.error('❌ Error desconocido:', apiError);
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
    register,
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
