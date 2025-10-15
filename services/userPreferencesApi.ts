import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/user-preferences';

export interface UserPreferences {
  userId: string;
  preferredSensorId: string | null;
  myNotificationIds: string[];
  totalNotifications: number;
  theme: 'light' | 'dark' | 'auto';
  updatedAt: string;
}

export interface SavePreferencesRequest {
  userId: string;
  preferredSensorId: string | null;
  myNotificationIds: string[];
  totalNotifications: number;
  theme: 'light' | 'dark' | 'auto';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class UserPreferencesApi {
  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // POST - Crear o actualizar preferencias del usuario
  async saveUserPreferences(preferences: SavePreferencesRequest, token: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await axios.post(API_BASE_URL, preferences, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error saving user preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar preferencias',
        error: error.message
      };
    }
  }

  // GET - Obtener preferencias del usuario
  async getUserPreferences(userId: string, token: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting user preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener preferencias',
        error: error.message
      };
    }
  }

  // GET - Obtener solo el sensor preferido del usuario (endpoint optimizado)
  async getPreferredSensor(userId: string, token: string): Promise<string | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}/sensor`, {
        headers: this.getAuthHeaders(token)
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.preferredSensorId;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting preferred sensor:', error);
      return null;
    }
  }

  // GET - Obtener todas las preferencias (para administración)
  async getAllUserPreferences(token: string, page: number = 1, limit: number = 10, sortBy: string = 'updatedAt', sortOrder: string = 'desc'): Promise<ApiResponse<{ data: UserPreferences[], pagination: any }>> {
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: this.getAuthHeaders(token),
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting all user preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener todas las preferencias',
        error: error.message
      };
    }
  }

  // GET - Obtener estadísticas de preferencias
  async getPreferencesStats(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting preferences stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estadísticas',
        error: error.message
      };
    }
  }

  // PUT - Actualizar preferencias del usuario
  async updateUserPreferences(userId: string, preferences: Partial<SavePreferencesRequest>, token: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/${userId}`, preferences, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar preferencias',
        error: error.message
      };
    }
  }

  // DELETE - Eliminar preferencias del usuario
  async deleteUserPreferences(userId: string, token: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${userId}`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar preferencias',
        error: error.message
      };
    }
  }
}

export const userPreferencesApi = new UserPreferencesApi();
