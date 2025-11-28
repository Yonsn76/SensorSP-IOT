import { API_BASE_URL, getAuthHeaders } from '../config/api';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  error?: string;
  deletedData?: {
    user: {
      id: string;
      username: string;
      email: string;
    };
    preferences: number;
    notifications: number;
  };
}

class AccountService {
  /**
   * Cambiar la contraseña del usuario autenticado
   */
  async changePassword(
    changePasswordData: ChangePasswordRequest,
    token: string
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(changePasswordData)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Contraseña cambiada exitosamente'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al cambiar la contraseña',
          error: data.error || 'Error desconocido'
        };
      }
    } catch (error: any) {
      console.error('Error in changePassword service:', error);
      return {
        success: false,
        message: 'Error de conexión al cambiar la contraseña',
        error: error.message || 'Error de red'
      };
    }
  }

  /**
   * Eliminar la cuenta del usuario autenticado
   */
  async deleteAccount(userId: string, token: string): Promise<DeleteAccountResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Cuenta eliminada exitosamente'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al eliminar la cuenta',
          error: data.error || 'Error desconocido'
        };
      }
    } catch (error: any) {
      console.error('Error in deleteAccount service:', error);
      return {
        success: false,
        message: 'Error de conexión al eliminar la cuenta',
        error: error.message || 'Error de red'
      };
    }
  }

  /**
   * Validar contraseña
   */
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: 'La contraseña es requerida' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    return { isValid: true };
  }

  /**
   * Validar confirmación de contraseña
   */
  validatePasswordConfirmation(password: string, confirmPassword: string): { isValid: boolean; message?: string } {
    if (!confirmPassword) {
      return { isValid: false, message: 'La confirmación de contraseña es requerida' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: 'Las contraseñas no coinciden' };
    }

    return { isValid: true };
  }

  /**
   * Validar que la nueva contraseña sea diferente a la actual
   */
  validatePasswordChange(currentPassword: string, newPassword: string): { isValid: boolean; message?: string } {
    if (currentPassword === newPassword) {
      return { isValid: false, message: 'La nueva contraseña debe ser diferente a la actual' };
    }

    return { isValid: true };
  }
}

export const accountService = new AccountService();

