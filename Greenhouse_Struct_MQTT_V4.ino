#include <ESP32Servo.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <SPI.h>
#include <BH1750.h>
#include <EspMQTTClient.h>

Adafruit_BMP280 bmp;
#define capteur_A A3
#define light_pin 35
const int soil_temp_pin = 4;
OneWire oneWire(soil_temp_pin);
DallasTemperature soilTempSensor(&oneWire);
#define soilMositurePin A0
#define soilMositurePin1 A5
const int AirValue = 3980;
const int WaterValue = 2150;
const int AirValue1 = 3860;
const int WaterValue1 = 2040;
#define uv_pin 34
#define relay_fan 32
#define relay_water 25
#define relay_lamp 27
#define servo_pin 26
Servo servo;
EspMQTTClient client(
  "mqtt",
  "anyday21",
  "broker.hivemq.com",
  "",
  "",
  "fnakf48anfe489",
  1883
);
unsigned long last_time = 0;
unsigned long time_elapsed = 1000;
struct Greenhouse {
  int rain = 0;
  int light_intensity = 0;
  int soilmoisture_percent = 0;
  double uv = 0;
  double temp = 0;
  double pressure = 0;
  double altitude = 0;
  float soil_temperature = 0;
};
Greenhouse state;
void setup() {
  Serial.begin(9600);
  initialize_BMP();
  initialize_Servo();
  soilTempSensor.begin();
  pinMode(uv_pin, INPUT);
  pinMode(capteur_A, INPUT);
  pinMode(light_pin, INPUT);
  pinMode(relay_fan, OUTPUT);
  pinMode(relay_water, OUTPUT);
  pinMode(relay_lamp, OUTPUT);
  pinMode(servo_pin, OUTPUT);
  client.enableDebuggingMessages();
  last_time = millis();
}
void onConnectionEstablished() {
  client.subscribe("aau_gh/manager/#", [](const String & topic, const String & payload) {
    if (topic == "aau_gh/manager/lightbulb")
      manageLightBulb(payload);
    if (topic == "aau_gh/manager/ventilation")
      manageVentilation(payload);
    if (topic == "aau_gh/manager/irrigation")
      manageIrrigation(payload);
    if (topic == "aau_gh/manager/automation")
      Automatic(payload);
  });
}
void manageLightBulb(String msg) {
  if (msg == "on")
    turnOnRelayLamp();
  else if (msg == "off")
    turnOffRelayLamp();
}
void manageVentilation(String msg) {
  if (msg == "on") {
    turnOnServo();
    turnOnRelayFan();
  }
  else if (msg == "off") {
    turnOffRelayFan();
    turnOffServo();
  }
}
void manageIrrigation(String msg) {
  if (msg == "on")
    turnOnRelayWater();
  else if (msg == "off")
    turnOffRelayWater();
}
void Automatic(String msg) {
  if (msg == "on")
    turnOnAutomaticMode();
  else if (msg == "off")
    turnOffAutomaticMode();
}
void loop() {
  client.loop();
  if ((millis() - last_time) > time_elapsed) {
    client.publish("aau_gh/climate/getTemperature", String(getTemperature()));
    client.publish("aau_gh/climate/getPressure", String(getPressure()));
    client.publish("aau_gh/climate/getAltitude", String(getAltitude()));
    client.publish("aau_gh/climate/getSoilTemp", String(getSoilTemp()));
    client.publish("aau_gh/climate/getSoilMoisture", String(getSoilMoisture()));
    client.publish("aau_gh/climate/getUV", String(getUV()));
    client.publish("aau_gh/climate/getRain", String(getRain()));
    client.publish("aau_gh/climate/getLux", String(getLux()));
    last_time = millis();
  }
}
void initialize_BMP() {
  bmp.begin(0x76);
}
void initialize_Servo() {
  servo.attach(servo_pin);
}
double getTemperature() {
  return bmp.readTemperature();
}
double getPressure() {
  return bmp.readPressure();
}
double getAltitude() {
  return bmp.readAltitude(1013.25);
}
int getRain() {
  int val_analogique = analogRead(capteur_A);
  int rain_val = map(val_analogique, 4095, 0, 0, 100);
  return rain_val;
}
int getLux() {
  int value = analogRead(light_pin);
  int value_map = map(value, 4095, 0, 0, 100);
  return value_map;
}
float getSoilTemp() {
  soilTempSensor.requestTemperatures();
  float temperatureC = soilTempSensor.getTempCByIndex(0);
  return temperatureC;
}
int getSoilMoisture() {
  int soilMoistureValue = analogRead(soilMositurePin);
  int soilMoistureValue1 = analogRead(soilMositurePin1);
  int soilmoisturepercent1 = map(soilMoistureValue, AirValue, WaterValue, 0, 100);
  int soilmoisturepercent2 = map(soilMoistureValue1, AirValue1, WaterValue1, 0, 100);
  int soilMoisture = (soilmoisturepercent1 + soilmoisturepercent2) / 2;
  if (soilMoisture <= 0)
    return 0;
  else if (soilMoisture >= 100)
    return 100;
  else
    return soilMoisture;
}
double getUV() {
  int analogValue = analogRead(uv_pin);
  double value_mV = analogValue * 5000.0 / 1023.0;
  double value_map = 0;
  if (value_mV <= 200) {
    value_map = map(value_mV, 0, 200, 0, 1);
  }
  else {
    value_map = map(value_mV, 201, 1200, 1, 11);
  }
  return value_map;
}
void turnOnRelayFan() {
  digitalWrite(relay_fan, HIGH);
}
void turnOffRelayFan() {
  digitalWrite(relay_fan, LOW);
}
void turnOnRelayWater() {
  digitalWrite(relay_water, HIGH);
}
void turnOffRelayWater() {
  digitalWrite(relay_water, LOW);
}
void turnOnRelayLamp() {
  digitalWrite(relay_lamp, HIGH);
}
void turnOffRelayLamp() {
  digitalWrite(relay_lamp, LOW);
}
void turnOnServo() {
  for (int angle = 0; angle < 180; angle++) {
    servo.write(angle);
    delay(15);
  }
}
void turnOffServo() {
  for (int angle = 180; angle >= 1; angle -= 5) {
    servo.write(angle);
    delay(5);
  }
}
void turnOnAutomaticMode() {
  double currentTemp = getTemperature();
  if (currentTemp > 28) {
    turnOnServo();
    turnOnRelayFan();
    turnOffRelayLamp();
  }
  else if (currentTemp < 23) {
    turnOffRelayFan();
    turnOffServo();
    turnOnRelayLamp();
  }
  else {
    turnOffRelayFan();
    turnOffServo();
    turnOffRelayLamp();
  }
  int moisture = getSoilMoisture();
  if (moisture < 50) {
    turnOnRelayWater();
  }
  else if (moisture > 80) {
    turnOffRelayWater();
  }
}
void turnOffAutomaticMode() {
  turnOffRelayFan();
  turnOffRelayWater();
  turnOffRelayLamp();
  turnOffServo();
}
