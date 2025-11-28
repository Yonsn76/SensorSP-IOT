import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WidgetData, WidgetService } from '../services/widgetService';
import { useAuth } from '../contexts/AuthContext';

interface WidgetContextType {
  widgetData: WidgetData | null;
  isLoading: boolean;
  error: string | null;
  refreshWidgetData: () => Promise<void>;
  clearCache: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

interface WidgetDataProviderProps {
  children: ReactNode;
}

export const WidgetDataProvider: React.FC<WidgetDataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWidgetData = async () => {
    if (!user?.id || !user?.token) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await WidgetService.getWidgetData(user.id, user.token);
      setWidgetData(data);
      
      console.log('Widget data loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading widget data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWidgetData = async () => {
    if (!user?.id || !user?.token) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await WidgetService.refreshWidgetData(user.id, user.token);
      setWidgetData(data);
      
      console.log('Widget data refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error refreshing widget data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await WidgetService.clearCache();
      console.log('Widget cache cleared');
    } catch (err) {
      console.error('Error clearing widget cache:', err);
    }
  };

  // Cargar datos iniciales cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id && user?.token) {
      loadWidgetData();
    }
  }, [user?.id, user?.token]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    if (!user?.id || !user?.token) return;

    const interval = setInterval(() => {
      loadWidgetData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user?.id, user?.token]);

  const value: WidgetContextType = {
    widgetData,
    isLoading,
    error,
    refreshWidgetData,
    clearCache,
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgetData = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgetData must be used within a WidgetDataProvider');
  }
  return context;
};
