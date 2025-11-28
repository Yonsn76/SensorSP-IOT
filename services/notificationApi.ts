import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, getAuthHeaders as getApiAuthHeaders } from '../config/api';

// Types matching the backend structure
export interface Notification {
  _id: string;
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  type: 'temperature' | 'humidity' | 'actuator' | 'status';
  condition: 'mayor_que' | 'menor_que' | 'igual_a' | 'cambia_a';
  value: number | string;
  message: string;
  location: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

export interface CreateNotificationRequest {
  userId: string;
  name: string;
  type: 'temperature' | 'humidity' | 'actuator' | 'status';
  condition: 'mayor_que' | 'menor_que' | 'igual_a' | 'cambia_a';
  value: number | string;
  message: string;
  location?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class NotificationApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
  });

  private getAuthHeaders(token: string) {
    return getApiAuthHeaders(token);
  }

  // POST - Crear notificación
  async createNotification(notification: CreateNotificationRequest, token: string): Promise<ApiResponse<Notification>> {
    try {
      const headers = this.getAuthHeaders(token);
      
      // Preparar el payload con todos los campos necesarios
      // El campo 'id' se genera automáticamente en el backend, no debe enviarse
      const payload = {
        ...notification
      };
      
      // Log detallado para debugging
      console.log('🔐 Token recibido:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('📤 Headers de autenticación:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? `${headers['Authorization'].substring(0, 30)}...` : 'NO AUTHORIZATION'
      });
      console.log('📝 Datos de notificación a enviar:', payload);
      console.log('🌐 URL completa:', `${this.api.defaults.baseURL}/notifications`);
      
      const response = await this.api.post('/notifications', payload, {
        headers: headers
      });
      
      console.log('✅ Respuesta exitosa:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating notification:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error statusText:', error.response?.statusText);
      
      // Extraer el mensaje de error específico del backend
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al crear notificación';
      const detailedError = typeof errorMessage === 'string' 
        ? errorMessage 
        : JSON.stringify(errorMessage);
      
      console.error('❌ Error detallado:', detailedError);
      
      // Si el error menciona que falta el campo 'id', intentar una solución alternativa
      if (detailedError.includes('id') && detailedError.includes('required')) {
        console.warn('⚠️ El backend requiere el campo "id". Intentando con ID generado...');
        // No intentamos de nuevo automáticamente, solo informamos
      }
      
      return {
        success: false,
        message: detailedError,
        error: error.message || 'Error desconocido'
      };
    }
  }

  // GET - Obtener notificaciones de un usuario
  async getUserNotifications(userId: string, token: string, status?: string, type?: string): Promise<ApiResponse<Notification[]>> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (type) params.append('type', type);

      const response = await this.api.get(`/notifications/user/${userId}?${params.toString()}`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting user notifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener notificaciones',
        error: error.message
      };
    }
  }

  // GET - Obtener notificaciones activas de un usuario
  async getActiveNotifications(userId: string, token: string): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await this.api.get(`/notifications/user/${userId}/active`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting active notifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener notificaciones activas',
        error: error.message
      };
    }
  }

  // GET - Obtener notificación por ID
  async getNotificationById(id: string, token: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.api.get(`/notifications/${id}`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting notification by ID:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener notificación',
        error: error.message
      };
    }
  }

  // PUT - Actualizar notificación
  async updateNotification(id: string, updateData: Partial<CreateNotificationRequest>, token: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.api.put(`/notifications/${id}`, updateData, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar notificación',
        error: error.message
      };
    }
  }

  // PUT - Activar notificación
  async activateNotification(id: string, userId: string, token: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.api.put(`/notifications/${id}/activate`, { userId }, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error activating notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al activar notificación',
        error: error.message
      };
    }
  }

  // PUT - Desactivar notificación
  async deactivateNotification(id: string, userId: string, token: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.api.put(`/notifications/${id}/deactivate`, { userId }, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deactivating notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al desactivar notificación',
        error: error.message
      };
    }
  }

  // DELETE - Eliminar notificación
  async deleteNotification(id: string, userId: string, token: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.delete(`/notifications/${id}`, {
        data: { userId },
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar notificación',
        error: error.message
      };
    }
  }

  // GET - Obtener estadísticas de notificaciones
  async getNotificationStats(userId: string, token: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/notifications/user/${userId}/stats`, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting notification stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estadísticas',
        error: error.message
      };
    }
  }
}

export const notificationApi = new NotificationApiService();
