import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { NotificationRule, notificationService } from './notificationService';
import { sensorApi, SensorData } from './sensorApi';

export interface ExportData {
  sensors: SensorData[];
  notifications: {
    rules: NotificationRule[];
    history: any[];
  };
  settings: {
    theme: string;
    user: any;
    appConfig: any;
  };
  stats: {
    totalSensors: number;
    avgTemperature: number;
    avgHumidity: number;
    totalNotifications: number;
    activeRules: number;
  };
  exportInfo: {
    date: string;
    version: string;
    platform: string;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includeSensors: boolean;
  includeNotifications: boolean;
  includeSettings: boolean;
  includeStats: boolean;
  // Opciones avanzadas de personalización
  sensorFilters?: {
    includeTemperature: boolean;
    includeHumidity: boolean;
    includeStatus: boolean;
    includeActuator: boolean;
    minTemperature?: number;
    maxTemperature?: number;
    minHumidity?: number;
    maxHumidity?: number;
    statusFilter?: string[];
    actuatorFilter?: string[];
  };
  dataOptions?: {
    includeAllHistorical: boolean;
    maxRecords?: number;
    groupByHour: boolean;
    groupByDay: boolean;
    includeRawData: boolean;
    includeProcessedData: boolean;
  };
  exportStructure?: {
    separateFiles: boolean;
    includeMetadata: boolean;
    includeCharts: boolean;
    includeSummary: boolean;
    customFields?: string[];
  };
}

class ExportService {
  private readonly EXPORT_DIR = `${FileSystem.documentDirectory}exports/`;

  constructor() {
    this.ensureExportDirectory();
  }

  private async ensureExportDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.EXPORT_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.EXPORT_DIR, { intermediates: true });
        console.log('   Directorio de exportación creado');
      }
    } catch (error) {
      console.error('  Error creando directorio de exportación:', error);
    }
  }

  private async collectData(options: ExportOptions): Promise<ExportData> {
    const data: ExportData = {
      sensors: [],
      notifications: { rules: [], history: [] },
      settings: { theme: '', user: null, appConfig: {} },
      stats: {
        totalSensors: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        totalNotifications: 0,
        activeRules: 0,
      },
      exportInfo: {
        date: new Date().toISOString(),
        version: '2025.1.0',
        platform: Platform.OS,
      },
    };

    try {
      console.log('🔄 Recopilando datos para exportación...');
      
      // Recopilar datos de sensores
      if (options.includeSensors) {
        console.log('Recopilando datos de sensores...');
        try {
          let sensorData: SensorData[] = [];
          
          if (options.dataOptions?.includeAllHistorical) {
            // Obtener todos los datos históricos disponibles
            console.log('📚 Recopilando todos los datos históricos...');
            sensorData = await sensorApi.getAllSensors();
          } else if (options.dateRange) {
            console.log(`📅 Rango de fechas: ${options.dateRange.start} - ${options.dateRange.end}`);
            sensorData = await sensorApi.getSensorsByDateRange(
            options.dateRange.start,
            options.dateRange.end
          );
        } else {
            // Obtener datos de las últimas 24 horas por defecto
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
            sensorData = await sensorApi.getSensorsByDateRange(
              startDate.toISOString(),
              endDate.toISOString()
            );
          }
          
          // Aplicar filtros de sensores si están definidos
          if (options.sensorFilters) {
            sensorData = this.applySensorFilters(sensorData, options.sensorFilters);
          }
          
          // Limitar número de registros si se especifica
          if (options.dataOptions?.maxRecords && options.dataOptions.maxRecords > 0) {
            sensorData = sensorData.slice(0, options.dataOptions.maxRecords);
          }
          
          data.sensors = sensorData;
          console.log(`   ${data.sensors.length} registros de sensores recopilados`);
        
        // Calcular estadísticas
        if (data.sensors.length > 0) {
            const temps = data.sensors.map(s => s.temperatura).filter(t => !isNaN(t));
            const hums = data.sensors.map(s => s.humedad).filter(h => !isNaN(h));
            
            data.stats.totalSensors = data.sensors.length;
            data.stats.avgTemperature = temps.length > 0 ? 
              Math.round((temps.reduce((sum, temp) => sum + temp, 0) / temps.length) * 10) / 10 : 0;
            data.stats.avgHumidity = hums.length > 0 ? 
              Math.round((hums.reduce((sum, hum) => sum + hum, 0) / hums.length) * 10) / 10 : 0;
          }
        } catch (error) {
          console.error('  Error recopilando datos de sensores:', error);
          // Continuar sin datos de sensores
        }
      }

      // Recopilar datos de notificaciones
      if (options.includeNotifications) {
        console.log('Recopilando datos de notificaciones...');
        try {
          data.notifications.rules = await notificationService.getNotificationRules();
          data.notifications.history = await notificationService.getNotificationHistory();
          data.stats.totalNotifications = data.notifications.history.length;
          data.stats.activeRules = data.notifications.rules.filter(rule => rule.enabled).length;
          console.log(`   ${data.notifications.rules.length} reglas y ${data.notifications.history.length} notificaciones recopiladas`);
        } catch (error) {
          console.log('   No se pudieron recopilar datos de notificaciones:', error);
          // Continuar sin datos de notificaciones
        }
      }

      // Recopilar configuraciones
      if (options.includeSettings) {
        console.log('Recopilando configuraciones...');
        try {
          const theme = await AsyncStorage.getItem('theme-preference');
          const user = await AsyncStorage.getItem('iot-dashboard-user');
          const appSettings = await AsyncStorage.getItem('app_settings');
          
          data.settings.theme = theme || 'system';
          data.settings.user = user ? JSON.parse(user) : null;
          data.settings.appConfig = appSettings ? JSON.parse(appSettings) : {};
          console.log('   Configuraciones recopiladas');
        } catch (error) {
          console.log('   No se pudieron recopilar configuraciones:', error);
          // Continuar con configuraciones por defecto
        }
      }

      console.log('   Recopilación de datos completada');
    } catch (error) {
      console.error('  Error recopilando datos para exportación:', error);
      throw new Error(`Error al recopilar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return data;
  }

  private applySensorFilters(sensors: SensorData[], filters: NonNullable<ExportOptions['sensorFilters']>): SensorData[] {
    return sensors.filter(sensor => {
      // Filtro por temperatura
      if (filters.minTemperature !== undefined && sensor.temperatura < filters.minTemperature) {
        return false;
      }
      if (filters.maxTemperature !== undefined && sensor.temperatura > filters.maxTemperature) {
        return false;
      }
      
      // Filtro por humedad
      if (filters.minHumidity !== undefined && sensor.humedad < filters.minHumidity) {
        return false;
      }
      if (filters.maxHumidity !== undefined && sensor.humedad > filters.maxHumidity) {
        return false;
      }
      
      // Filtro por estado
      if (filters.statusFilter && filters.statusFilter.length > 0) {
        if (!filters.statusFilter.includes(sensor.estado)) {
          return false;
        }
      }
      
      // Filtro por actuador
      if (filters.actuatorFilter && filters.actuatorFilter.length > 0) {
        if (!filters.actuatorFilter.includes(sensor.actuador)) {
          return false;
        }
      }
      
      return true;
    });
  }

  private generateCSV(data: ExportData, options?: ExportOptions): string {
    let csv = '';

    // Información de exportación
    if (options?.exportStructure?.includeMetadata !== false) {
    csv += 'Información de Exportación\n';
    csv += `Fecha: ${new Date(data.exportInfo.date).toLocaleString()}\n`;
    csv += `Plataforma: ${data.exportInfo.platform}\n`;
      csv += `Versión: ${data.exportInfo.version}\n`;
      csv += `Total de Registros: ${data.sensors.length}\n\n`;
    }

    // Estadísticas generales
    if (options?.exportStructure?.includeSummary !== false) {
    csv += 'Estadísticas Generales\n';
    csv += `Total de Sensores: ${data.stats.totalSensors}\n`;
    csv += `Temperatura Promedio: ${data.stats.avgTemperature}°C\n`;
    csv += `Humedad Promedio: ${data.stats.avgHumidity}%\n`;
    csv += `Total de Notificaciones: ${data.stats.totalNotifications}\n`;
    csv += `Reglas Activas: ${data.stats.activeRules}\n\n`;
    }

    // Datos de sensores
    if (data.sensors.length > 0) {
      csv += 'Datos de Sensores\n';
      
      // Generar encabezados dinámicamente basado en filtros
      const headers = ['ID', 'Fecha'];
      if (options?.sensorFilters?.includeTemperature !== false) headers.push('Temperatura');
      if (options?.sensorFilters?.includeHumidity !== false) headers.push('Humedad');
      if (options?.sensorFilters?.includeStatus !== false) headers.push('Estado');
      if (options?.sensorFilters?.includeActuator !== false) headers.push('Actuador');
      
      csv += headers.join(',') + '\n';
      
      data.sensors.forEach(sensor => {
        const row = [sensor._id, sensor.fecha];
        if (options?.sensorFilters?.includeTemperature !== false) row.push(sensor.temperatura.toString());
        if (options?.sensorFilters?.includeHumidity !== false) row.push(sensor.humedad.toString());
        if (options?.sensorFilters?.includeStatus !== false) row.push(sensor.estado);
        if (options?.sensorFilters?.includeActuator !== false) row.push(sensor.actuador);
        
        csv += row.join(',') + '\n';
      });
      csv += '\n';
    }

    // Reglas de notificación
    if (data.notifications.rules.length > 0) {
      csv += 'Reglas de Notificación\n';
      csv += 'ID,Nombre,Tipo,Condición,Valor,Mensaje,Activa\n';
      data.notifications.rules.forEach(rule => {
        csv += `${rule.id},${rule.name},${rule.type},${rule.condition},${rule.value},"${rule.message}",${rule.enabled}\n`;
      });
      csv += '\n';
    }

    // Historial de notificaciones
    if (data.notifications.history.length > 0) {
      csv += 'Historial de Notificaciones\n';
      csv += 'Fecha,Título,Mensaje,Tipo\n';
      data.notifications.history.forEach(notification => {
        csv += `${notification.date},${notification.title},${notification.body},${notification.type}\n`;
      });
    }

    return csv;
  }

  private generateJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  private async generatePDF(data: ExportData): Promise<string> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte IoT Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #007AFF; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #007AFF; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #007AFF; }
          .stat-label { color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .info { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte IoT Dashboard</h1>
          <p>Generado el ${new Date(data.exportInfo.date).toLocaleString()}</p>
          <p>Plataforma: ${data.exportInfo.platform} | Versión: ${data.exportInfo.version}</p>
        </div>

        <div class="section">
          <h2>📈 Estadísticas Generales</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.stats.totalSensors}</div>
              <div class="stat-label">Total Sensores</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.stats.avgTemperature}°C</div>
              <div class="stat-label">Temperatura Promedio</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.stats.avgHumidity}%</div>
              <div class="stat-label">Humedad Promedio</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.stats.totalNotifications}</div>
              <div class="stat-label">Total Notificaciones</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.stats.activeRules}</div>
              <div class="stat-label">Reglas Activas</div>
            </div>
          </div>
        </div>

        ${data.sensors.length > 0 ? `
        <div class="section">
          <h2>Datos de Sensores (${data.sensors.length} registros)</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Temperatura</th>
                <th>Humedad</th>
                <th>Estado</th>
                <th>Actuador</th>
              </tr>
            </thead>
            <tbody>
              ${data.sensors.slice(0, 50).map(sensor => `
                <tr>
                  <td>${new Date(sensor.fecha).toLocaleString()}</td>
                  <td>${sensor.temperatura}°C</td>
                  <td>${sensor.humedad}%</td>
                  <td>${sensor.estado}</td>
                  <td>${sensor.actuador}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${data.sensors.length > 50 ? `<p><em>Mostrando los primeros 50 registros de ${data.sensors.length} totales</em></p>` : ''}
        </div>
        ` : ''}

        ${data.notifications.rules.length > 0 ? `
        <div class="section">
          <h2>Reglas de Notificación (${data.notifications.rules.length} reglas)</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Condición</th>
                <th>Valor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${data.notifications.rules.map(rule => `
                <tr>
                  <td>${rule.name}</td>
                  <td>${rule.type}</td>
                  <td>${rule.condition}</td>
                  <td>${rule.value}</td>
                  <td>${rule.enabled ? '   Activa' : '  Inactiva'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.notifications.history.length > 0 ? `
        <div class="section">
          <h2> Historial de Notificaciones (${data.notifications.history.length} notificaciones)</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Mensaje</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              ${data.notifications.history.slice(0, 30).map(notification => `
                <tr>
                  <td>${new Date(notification.date).toLocaleString()}</td>
                  <td>${notification.title}</td>
                  <td>${notification.body}</td>
                  <td>${notification.type}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${data.notifications.history.length > 30 ? `<p><em>Mostrando las últimas 30 notificaciones de ${data.notifications.history.length} totales</em></p>` : ''}
        </div>
        ` : ''}

        <div class="section">
          <h2>Configuración</h2>
          <div class="info">
            <p><strong>Tema:</strong> ${data.settings.theme}</p>
            <p><strong>Usuario:</strong> ${data.settings.user ? data.settings.user.username : 'No configurado'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      console.error('  Error generando PDF:', error);
      throw new Error('Error al generar PDF');
    }
  }

  async exportData(options: ExportOptions): Promise<string> {
    try {
      console.log('🔄 Iniciando exportación de datos...');
      console.log('📋 Opciones de exportación:', options);
      
      // Validar opciones
      if (!options.format || !['csv', 'json', 'pdf'].includes(options.format)) {
        throw new Error('Formato de exportación no válido');
      }
      
      // Verificar que al menos una opción esté habilitada
      const hasContent = options.includeSensors || options.includeNotifications || 
                        options.includeSettings || options.includeStats;
      if (!hasContent) {
        throw new Error('Debe seleccionar al menos un tipo de contenido para exportar');
      }
      
      // Asegurar que el directorio existe
      await this.ensureExportDirectory();
      
      // Recopilar datos
      const data = await this.collectData(options);
      
      // Validar que hay datos para exportar
      const hasData = data.sensors.length > 0 || data.notifications.rules.length > 0 || 
                     data.notifications.history.length > 0 || data.settings.user !== null;
      if (!hasData) {
        throw new Error('No hay datos disponibles para exportar en el rango seleccionado');
      }
      
      // Generar archivo según formato
      let fileUri: string;
      let fileName: string;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      console.log(`📝 Generando archivo en formato ${options.format.toUpperCase()}...`);
      
      switch (options.format) {
        case 'csv':
          const csvContent = this.generateCSV(data, options);
          fileName = `sensorsp-datos-${timestamp}.csv`;
          fileUri = `${this.EXPORT_DIR}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, csvContent, { 
            encoding: 'utf8' 
          });
          break;
          
        case 'json':
          const jsonContent = this.generateJSON(data);
          fileName = `sensorsp-datos-${timestamp}.json`;
          fileUri = `${this.EXPORT_DIR}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, jsonContent, { 
            encoding: 'utf8' 
          });
          break;
          
        case 'pdf':
          fileUri = await this.generatePDF(data);
          fileName = `sensorsp-reporte-${timestamp}.pdf`;
          break;
          
        default:
          throw new Error('Formato de exportación no soportado');
      }
      
      // Verificar que el archivo se creó correctamente
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Error al crear el archivo de exportación');
      }
      
      console.log(`   Exportación completada: ${fileName} (${fileInfo.size} bytes)`);
      return fileUri;
      
    } catch (error) {
      console.error('  Error en exportación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al exportar datos: ${errorMessage}`);
    }
  }

  async shareFile(fileUri: string): Promise<void> {
    try {
      console.log('📤 Iniciando proceso de compartir archivo...');
      
      // Verificar que el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo de exportación no existe');
      }
      
      console.log(`📁 Archivo a compartir: ${fileInfo.uri} (${fileInfo.size} bytes)`);
      
      // Verificar si sharing está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('La función de compartir no está disponible en este dispositivo');
      }
      
      // Compartir el archivo
      await Sharing.shareAsync(fileUri, {
        mimeType: this.getMimeType(fileUri),
        dialogTitle: 'Compartir datos de SensorSP',
        UTI: this.getUTI(fileUri)
      });
      
        console.log('   Archivo compartido exitosamente');
    } catch (error) {
      console.error('  Error compartiendo archivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al compartir archivo: ${errorMessage}`);
    }
  }

  private getMimeType(fileUri: string): string {
    if (fileUri.endsWith('.csv')) return 'text/csv';
    if (fileUri.endsWith('.json')) return 'application/json';
    if (fileUri.endsWith('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
  }

  private getUTI(fileUri: string): string {
    if (fileUri.endsWith('.csv')) return 'public.comma-separated-values-text';
    if (fileUri.endsWith('.json')) return 'public.json';
    if (fileUri.endsWith('.pdf')) return 'com.adobe.pdf';
    return 'public.data';
  }

  async getExportHistory(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.EXPORT_DIR);
      return files.filter(file => 
        file.endsWith('.csv') || 
        file.endsWith('.json') || 
        file.endsWith('.pdf')
      );
    } catch (error) {
      console.error('  Error obteniendo historial de exportaciones:', error);
      return [];
    }
  }

  async deleteExport(fileName: string): Promise<void> {
    try {
      const fileUri = `${this.EXPORT_DIR}${fileName}`;
      await FileSystem.deleteAsync(fileUri);
      console.log(`   Archivo eliminado: ${fileName}`);
    } catch (error) {
      console.error('  Error eliminando archivo:', error);
      throw new Error('Error al eliminar archivo');
    }
  }

  async clearAllExports(): Promise<void> {
    try {
      const files = await this.getExportHistory();
      for (const file of files) {
        await this.deleteExport(file);
      }
      console.log('   Todos los archivos de exportación eliminados');
    } catch (error) {
      console.error('  Error limpiando exportaciones:', error);
      throw new Error('Error al limpiar exportaciones');
    }
  }
}

export const exportService = new ExportService();
