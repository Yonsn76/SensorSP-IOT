import axios from 'axios';

// API Base URL - Local development
const API_BASE_URL = 'http://localhost:3000/api';

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
    timeout: 10000,
  });

  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // POST - Crear notificación
  async createNotification(notification: CreateNotificationRequest, token: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.api.post('/notifications', notification, {
        headers: this.getAuthHeaders(token)
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear notificación',
        error: error.message
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
