import { useAuth } from '../contexts/AuthContext';

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewRecords: boolean;
  canViewHistorics: boolean;
  canViewNotifications: boolean;
  canManageSettings: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canViewSystemSettings: boolean;
  canModifyNotifications: boolean;
  canAccessDebugMode: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isLoggedIn = !!user;

  return {
    // Permisos básicos - todos los usuarios logueados
    canViewDashboard: isLoggedIn,
    canViewRecords: isLoggedIn,
    canViewHistorics: isLoggedIn,
    canViewNotifications: isLoggedIn,
    
    // Permisos de configuración - solo admin
    canManageSettings: isAdmin,
    canExportData: isAdmin,
    canManageUsers: isAdmin,
    canViewSystemSettings: isAdmin,
    canModifyNotifications: isAdmin,
    canAccessDebugMode: isAdmin,
  };
};

export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

export const useIsUser = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'user';
};
