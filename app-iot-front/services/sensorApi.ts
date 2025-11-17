import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Types matching the ESP32 data structure
export interface SensorData {
  _id: string;
  fecha: string;
  sensorId?: string;
  ubicacion?: string;
  tipo?: string;
  modelo?: string;
  temperatura: number;
  humedad: number;
  estado: 'normal' | 'frio' | 'caliente' | 'humedo' | 'seco';
  actuador: string;
}

export interface SensorStats {
  totalReadings: number;
  avgTemperature: number;
  avgHumidity: number;
  statusDistribution: Record<string, number>;
  actuatorDistribution: Record<string, number>;
}

export interface DateRange {
  start: string;
  end: string;
}

class SensorApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
  });

  async getAllSensors(): Promise<SensorData[]> {
    try {
      console.log('Fetching all sensors from API...');
      const response = await this.api.get<SensorData[]>('/sensors');
      // Sort by date descending to get the most recent first
      const sortedData = response.data.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      console.log(`Fetched ${sortedData.length} sensor readings`);
      return sortedData;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      throw new Error('Failed to fetch sensor data');
    }
  }

  async getSensorsByDateRange(startDate: string, endDate: string): Promise<SensorData[]> {
    try {
      console.log(`Fetching sensors from ${startDate} to ${endDate}...`);
      const allSensors = await this.getAllSensors();
      const filteredSensors = allSensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return sensorDate >= start && sensorDate <= end;
      });
      console.log(`Filtered ${filteredSensors.length} sensor readings`);
      return filteredSensors;
    } catch (error) {
      console.error('Error fetching filtered sensor data:', error);
      throw new Error('Failed to fetch filtered sensor data');
    }
  }

  calculateStats(sensors: SensorData[]): SensorStats {
    if (sensors.length === 0) {
      return {
        totalReadings: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        statusDistribution: {},
        actuatorDistribution: {},
      };
    }

    const totalReadings = sensors.length;
    const avgTemperature = sensors.reduce((sum, sensor) => sum + sensor.temperatura, 0) / totalReadings;
    const avgHumidity = sensors.reduce((sum, sensor) => sum + sensor.humedad, 0) / totalReadings;

    const statusDistribution: Record<string, number> = {};
    const actuatorDistribution: Record<string, number> = {};

    sensors.forEach(sensor => {
      statusDistribution[sensor.estado] = (statusDistribution[sensor.estado] || 0) + 1;
      actuatorDistribution[sensor.actuador] = (actuatorDistribution[sensor.actuador] || 0) + 1;
    });

    return {
      totalReadings,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      statusDistribution,
      actuatorDistribution,
    };
  }

  getLatestReadings(sensors: SensorData[], count: number = 10): SensorData[] {
    return sensors
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, count);
  }

  async getLatestSensor(): Promise<SensorData | null> {
    try {
      const sensors = await this.getAllSensors();
      if (sensors.length > 0) {
        return sensors[0]; // Since getAllSensors now returns sorted data
      }
      return null;
    } catch (error) {
      console.error('  Error fetching latest sensor:', error);
      return null;
    }
  }

  getTemperatureTrend(sensors: SensorData[]): Array<{ fecha: string; temperatura: number; humedad: number }> {
    return sensors
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(sensor => ({
        fecha: sensor.fecha,
        temperatura: sensor.temperatura,
        humedad: sensor.humedad,
      }));
  }

  // Get data for last 6 hours
  async getLastHoursData(): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
      
      const sensors = await this.getSensorsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching last hours data:', error);
      return [];
    }
  }

  // Get data for today (current day)
  async getTodayData(): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const sensors = await this.getSensorsByDateRange(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching today data:', error);
      return [];
    }
  }

  // Get data for charts (last 24 hours)
  async getChartData(): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const sensors = await this.getSensorsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching chart data:', error);
      return [];
    }
  }

  // Get data for weekly chart
  async getWeeklyData(): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const sensors = await this.getSensorsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching weekly data:', error);
      return [];
    }
  }

  // Get data for monthly chart
  async getMonthlyData(): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const sensors = await this.getSensorsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching monthly data:', error);
      return [];
    }
  }

  // Get data for custom date range
  async getCustomRangeData(startDate: Date, endDate: Date): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const sensors = await this.getSensorsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching custom range data:', error);
      return [];
    }
  }

  // Get data for yearly chart
  async getYearlyData(): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 days ago
      
      const sensors = await this.getSensorsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return this.getTemperatureTrend(sensors);
    } catch (error) {
      console.error('  Error fetching yearly data:', error);
      return [];
    }
  }

  // Get sensors by specific sensorId
  async getSensorsBySensorId(sensorId: string): Promise<SensorData[]> {
    try {
      const response = await this.api.get('/sensors');
      return response.data.filter((sensor: SensorData) => sensor.sensorId === sensorId);
    } catch (error) {
      console.error('Error fetching sensors by sensorId:', error);
      return [];
    }
  }

  // Get last hours data for specific sensor
  async getLastHoursDataBySensorId(sensorId: string): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const sensors = await this.getSensorsBySensorId(sensorId);
      const filteredSensors = sensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        return sensorDate >= startDate && sensorDate <= endDate;
      });
      
      return this.getTemperatureTrend(filteredSensors);
    } catch (error) {
      console.error('Error fetching last hours data by sensorId:', error);
      return [];
    }
  }

  // Get today data for specific sensor
  async getTodayDataBySensorId(sensorId: string): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const sensors = await this.getSensorsBySensorId(sensorId);
      const filteredSensors = sensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        return sensorDate >= startDate && sensorDate <= endDate;
      });
      
      return this.getTemperatureTrend(filteredSensors);
    } catch (error) {
      console.error('Error fetching today data by sensorId:', error);
      return [];
    }
  }

  // Get weekly data for specific sensor
  async getWeeklyDataBySensorId(sensorId: string): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const sensors = await this.getSensorsBySensorId(sensorId);
      const filteredSensors = sensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        return sensorDate >= startDate && sensorDate <= endDate;
      });
      
      return this.getTemperatureTrend(filteredSensors);
    } catch (error) {
      console.error('Error fetching weekly data by sensorId:', error);
      return [];
    }
  }

  // Get monthly data for specific sensor
  async getMonthlyDataBySensorId(sensorId: string): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const sensors = await this.getSensorsBySensorId(sensorId);
      const filteredSensors = sensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        return sensorDate >= startDate && sensorDate <= endDate;
      });
      
      return this.getTemperatureTrend(filteredSensors);
    } catch (error) {
      console.error('Error fetching monthly data by sensorId:', error);
      return [];
    }
  }

  // Get custom range data for specific sensor
  async getCustomRangeDataBySensorId(sensorId: string, startDate: Date, endDate: Date): Promise<Array<{ fecha: string; temperatura: number; humedad: number }>> {
    try {
      const sensors = await this.getSensorsBySensorId(sensorId);
      const filteredSensors = sensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        return sensorDate >= startDate && sensorDate <= endDate;
      });
      
      return this.getTemperatureTrend(filteredSensors);
    } catch (error) {
      console.error('Error fetching custom range data by sensorId:', error);
      return [];
    }
  }
}

export const sensorApi = new SensorApiService();
