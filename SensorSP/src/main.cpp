#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include "time.h"

// ===============================
// CONFIGURACIÓN DE HARDWARE
// ===============================
#define DHTPIN 4     
#define DHTTYPE DHT22  
DHT dht(DHTPIN, DHTTYPE);

// Pines para los relés 
#define PIN_RELE_VENTILADOR  12
#define PIN_RELE_CALEFACTOR  13

// ===============================
// CONFIGURACIÓN DE RED Y API
// ===============================
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverName = "https://iot-final-api.onrender.com/api/sensors";

// ===============================
// CONFIGURACIÓN DEL SENSOR
// ===============================
const char* SENSOR_ID = "TEMP_004";
const char* SENSOR_NOMBRE = "Temperatura Aula 34";
const char* SENSOR_UBICACION = "Aula de Computo";
const char* SENSOR_TIPO = "temperatura";
const char* SENSOR_MODELO = "DHT22";

// ===============================
// CONFIGURACIÓN NTP (Perú GMT-5)
// ===============================
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -5 * 3600;  
const int daylightOffset_sec = 0;

// ===============================
// VARIABLES DE TIEMPO
// ===============================
unsigned long lastTime = 0;
const long interval = 10000; 

// ===============================
// CONFIGURACIÓN DEBUG
// ===============================
const bool DEBUG_MODE = true;  
const int SERIAL_BAUD = 115200;

// ===============================
// SETUP
// ===============================
void setup() {
  if (DEBUG_MODE) {
    Serial.begin(SERIAL_BAUD);
    delay(100);
    Serial.println("🚀 Iniciando sistema ESP32...");
  }

  // Inicializar DHT
  dht.begin();
  delay(2000); // Esperar a que el DHT22 se estabilice
  if (DEBUG_MODE) Serial.println("✅ DHT22 inicializado");

  // Configurar pines de los relés como salida
  pinMode(PIN_RELE_VENTILADOR, OUTPUT);
  pinMode(PIN_RELE_CALEFACTOR, OUTPUT);
  digitalWrite(PIN_RELE_VENTILADOR, LOW);
  digitalWrite(PIN_RELE_CALEFACTOR, LOW);

  // Conectar WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  if (DEBUG_MODE) Serial.print("Conectando a WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    if (DEBUG_MODE) Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    if (DEBUG_MODE) {
      Serial.println("\n✅ Conectado al WiFi!");
      Serial.print("IP asignada: ");
      Serial.println(WiFi.localIP());
    }
  } else {
    if (DEBUG_MODE) Serial.println("\n❌ Fallo en la conexión WiFi");
    return;
  }

  // Configurar NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  if (DEBUG_MODE) Serial.print("⏰ Configurando NTP");
  
  // Esperar a que se sincronice el tiempo
  int ntpAttempts = 0;
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo) && ntpAttempts < 15) {
    if (DEBUG_MODE) Serial.print(".");
    delay(1000);
    ntpAttempts++;
  }
  
  if (ntpAttempts < 15) {
    if (DEBUG_MODE) {
      Serial.println("\n✅ Tiempo NTP sincronizado");
      char buffer[25];
      strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
      Serial.print("Hora actual: ");
      Serial.println(buffer);
    }
  } else {
    if (DEBUG_MODE) Serial.println("\n❌ Error sincronizando NTP");
  }

  Serial.println("----------------------------------------");
}

// ===============================
// OBTENER FECHA Y HORA
// ===============================
String getFechaHora() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    if (DEBUG_MODE) Serial.println("⚠️ Error obteniendo hora NTP");
    return "";
  }
  
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(buffer);
}

// ===============================
// ENVIAR DATOS A LA API
// ===============================
void enviarDatos() {
  if (WiFi.status() != WL_CONNECTED) {
    if (DEBUG_MODE) Serial.println("❌ WiFi desconectado, intentando reconectar...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  // Leer sensores
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();

  // Verificar lectura de sensores
  if (isnan(temperatura) || isnan(humedad)) {
    if (DEBUG_MODE) Serial.println("❌ Error al leer el DHT22");
    digitalWrite(PIN_RELE_VENTILADOR, LOW);
    digitalWrite(PIN_RELE_CALEFACTOR, LOW);
    return;
  }

  // Mostrar lecturas en Serial
  if (DEBUG_MODE) {
    Serial.println("📊 Lecturas de sensores:");
    Serial.print("🌡️ Temperatura: ");
    Serial.print(temperatura);
    Serial.println(" °C");
    Serial.print("💧 Humedad: ");
    Serial.print(humedad);
    Serial.println(" %");
  }

  String fechaHora = getFechaHora();

  String estado = "normal";
  String actuador = "ninguno";
  
  // Lógica de control de temperatura
  if (temperatura > 30) {
    estado = "caliente";
    actuador = "ventilador";
  } else if (temperatura < 20) {
    estado = "frio";
    actuador = "calefactor";
  }

  // Lógica de control de humedad (no sobrescribir si ya hay actuador)
  if (humedad > 80) {
    estado = (actuador != "ninguno") ? estado + "/humedo" : "humedo";
  } else if (humedad < 30) {
    estado = (actuador != "ninguno") ? estado + "/seco" : "seco";
  }

  // Crear JSON
  String jsonData = "{";
  jsonData += "\"sensorId\":\"" + String(SENSOR_ID) + "\",";
  jsonData += "\"ubicacion\":\"" + String(SENSOR_UBICACION) + "\",";
  jsonData += "\"tipo\":\"" + String(SENSOR_TIPO) + "\",";
  jsonData += "\"modelo\":\"" + String(SENSOR_MODELO) + "\",";
  jsonData += "\"temperatura\":" + String(temperatura, 2) + ",";
  jsonData += "\"humedad\":" + String(humedad, 2) + ",";
  jsonData += "\"estado\":\"" + estado + "\",";
  jsonData += "\"actuador\":\"" + actuador + "\"";
  jsonData += "}";

  if (DEBUG_MODE) {
    Serial.println("📤 Enviando datos a la API:");
    Serial.println(jsonData);
  }

  // --- CONTROL DE RELÉS ---
  if (actuador == "ventilador") {
    digitalWrite(PIN_RELE_VENTILADOR, HIGH);
    digitalWrite(PIN_RELE_CALEFACTOR, LOW);
    if (DEBUG_MODE) Serial.println("🌀 Ventilador ENCENDIDO");
  } else if (actuador == "calefactor") {
    digitalWrite(PIN_RELE_VENTILADOR, LOW);
    digitalWrite(PIN_RELE_CALEFACTOR, HIGH);
    if (DEBUG_MODE) Serial.println("🔥 Calefactor ENCENDIDO");
  } else {
    digitalWrite(PIN_RELE_VENTILADOR, LOW);
    digitalWrite(PIN_RELE_CALEFACTOR, LOW);
    if (DEBUG_MODE) Serial.println("⚪ Actuadores APAGADOS");
  }

  // --- ENVÍO HTTP ---
  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000);

  int httpResponseCode = http.POST(jsonData);

  if (httpResponseCode > 0) {
    if (DEBUG_MODE) {
      Serial.print("✅ Respuesta API: ");
      Serial.println(httpResponseCode);
      if (httpResponseCode == 200 || httpResponseCode == 201) {
        String response = http.getString();
        Serial.println("📥 Respuesta completa:");
        Serial.println(response);
      }
    }
  } else {
    if (DEBUG_MODE) {
      Serial.print("❌ Error en POST: ");
      Serial.println(httpResponseCode);
      Serial.print("Error: ");
      Serial.println(http.errorToString(httpResponseCode));
    }
  }

  http.end();
}

// ===============================
// LOOP PRINCIPAL
// ===============================
void loop() {
  unsigned long currentTime = millis();
  
  // Enviar datos cada intervalo (10s)
  if (currentTime - lastTime >= interval) {
    enviarDatos();
    lastTime = currentTime;
    
    if (DEBUG_MODE) {
      Serial.print("📡 Estado WiFi: ");
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Conectado");
        Serial.print("📶 Señal: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
      } else {
        Serial.println("Desconectado");
      }
      
      Serial.println("⏳ Esperando próximo envío...");
      Serial.println("----------------------------------------");
    }
  }
  
  delay(100);
}
