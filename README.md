# AAU Smart Greenhouse 🌱

A complete IoT solution for monitoring and controlling a smart greenhouse system. This project includes ESP32 firmware, a modern web interface, a Node.js backend, and Home Assistant integration.

## 🌟 Features

- **Real-time Monitoring**: Temperature, pressure, soil moisture, UV index, rain detection, and light intensity
- **Remote Control**: Control lighting, ventilation, and irrigation from anywhere
- **Automatic Mode**: Intelligent automation based on sensor readings
- **Modern Web Dashboard**: Beautiful, responsive React-based interface
- **Home Assistant Integration**: Full MQTT integration with pre-configured sensors and automations
- **Live Updates**: WebSocket-based real-time data updates

## 📋 Table of Contents

- [Hardware](#hardware)
- [Software Architecture](#software-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Home Assistant Integration](#home-assistant-integration)
- [API Documentation](#api-documentation)
- [License](#license)

## 🔧 Hardware

### Microcontroller
- **ESP32 NodeMCU**

### Sensors
- **FC-37** - Rain Sensor
- **Capacitive Soil Moisture Sensor v1.2** - Soil moisture measurement
- **DS18B20** - Soil temperature sensor
- **BMP280** - Temperature, pressure, and altitude sensor
- **UVM30A** - UV sensor
- **ARD SEN LDR** - Light intensity sensor

### Actuators
- **2x FUNGWAN MG 996R** - Servo motors for window/vent control
- **3-Wire Fan** - Ventilation fan
- **3x 5V Relays** - Control switches for various devices
- **230V Lamp** - Supplemental lighting

## 🏗️ Software Architecture

```
aau_smartgreenhouse/
├── Greenhouse_Struct_MQTT_V4.ino  # ESP32 firmware
├── backend/                        # Node.js backend server
│   ├── server.js                  # Express server with MQTT client
│   ├── package.json
│   └── .env.example
├── frontend/                       # React web interface
│   ├── src/
│   │   ├── App.jsx               # Main application component
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── homeassistant/                 # Home Assistant integration
│   ├── sensors.yaml              # Sensor definitions
│   ├── switches.yaml             # Switch definitions
│   ├── automations.yaml          # Automation examples
│   └── dashboard.yaml            # Lovelace dashboard config
└── nodered ui.json               # Legacy Node-RED configuration
```

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Arduino IDE** (for ESP32 firmware)
- **MQTT Broker** (e.g., HiveMQ, Mosquitto, or Home Assistant's built-in broker)

### ESP32 Firmware Setup

1. Install the Arduino IDE
2. Install ESP32 board support
3. Install required libraries:
   - ESP32Servo
   - Adafruit_BMP280
   - Adafruit_Sensor
   - OneWire
   - DallasTemperature
   - BH1750
   - EspMQTTClient

4. Open `Greenhouse_Struct_MQTT_V4.ino`
5. Update WiFi credentials and MQTT broker settings (lines 29-37)
6. Upload to ESP32

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MQTT broker settings
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## ⚙️ Configuration

### MQTT Configuration

Edit the backend `.env` file:

```env
PORT=3001
MQTT_BROKER=mqtt://broker.hivemq.com
```

Or for a local Mosquitto broker:

```env
MQTT_BROKER=mqtt://localhost:1883
```

### ESP32 Configuration

Update in `Greenhouse_Struct_MQTT_V4.ino`:

```cpp
EspMQTTClient client(
  "YOUR_WIFI_SSID",      // WiFi SSID
  "YOUR_WIFI_PASSWORD",   // WiFi password
  "broker.hivemq.com",    // MQTT broker
  "",                     // MQTT username (if required)
  "",                     // MQTT password (if required)
  "greenhouse_client",    // Client ID
  1883                    // MQTT port
);
```

## 💻 Usage

### Web Dashboard

1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm run dev`
3. Open browser to `http://localhost:3000`

The dashboard shows:
- Real-time sensor readings
- Control switches for all actuators
- Automatic mode toggle
- Live connection status

### Control Devices

Use the control panel to:
- Toggle **Automatic Mode** for intelligent automation
- Control **Light** (230V lamp)
- Control **Ventilation** (fan and servo)
- Control **Irrigation** (water pump)

### Automatic Mode

When enabled, the system automatically:
- Activates ventilation when temperature > 28°C
- Turns on heating when temperature < 23°C
- Starts irrigation when soil moisture < 50%
- Stops irrigation when soil moisture > 80%

## 🏠 Home Assistant Integration

### Setup

1. Ensure Home Assistant has MQTT configured
2. Copy files from `homeassistant/` directory
3. Add to `configuration.yaml`:

```yaml
# MQTT
mqtt:
  broker: broker.hivemq.com
  port: 1883

# Sensors
sensor: !include sensors.yaml

# Switches
switch: !include switches.yaml
```

4. Restart Home Assistant
5. Add the dashboard using `dashboard.yaml`

### Available Entities

**Sensors:**
- `sensor.greenhouse_temperature`
- `sensor.greenhouse_pressure`
- `sensor.greenhouse_soil_moisture`
- `sensor.greenhouse_soil_temperature`
- `sensor.greenhouse_uv_index`
- `sensor.greenhouse_rain`
- `sensor.greenhouse_light_intensity`
- `sensor.greenhouse_altitude`

**Switches:**
- `switch.greenhouse_light`
- `switch.greenhouse_ventilation`
- `switch.greenhouse_irrigation`
- `switch.greenhouse_automation`

## 📡 API Documentation

### REST API Endpoints

#### GET `/api/status`
Returns backend and MQTT connection status

#### GET `/api/data`
Returns all sensor data and device states

#### POST `/api/control/lightbulb`
Control the light
```json
{ "state": "on" }  // or "off"
```

#### POST `/api/control/ventilation`
Control ventilation
```json
{ "state": "on" }  // or "off"
```

#### POST `/api/control/irrigation`
Control irrigation
```json
{ "state": "on" }  // or "off"
```

#### POST `/api/control/automation`
Toggle automatic mode
```json
{ "state": "on" }  // or "off"
```

### WebSocket API

Connect to `ws://localhost:3001` for real-time updates

**Messages received:**
```json
{
  "type": "initial",  // or "update"
  "data": {
    "climate": { /* sensor data */ },
    "manager": { /* device states */ }
  }
}
```

## 📸 Gallery

![ezgif com-gif-maker](https://user-images.githubusercontent.com/75416341/127112592-78f6b7f0-ea5b-4a79-b5cd-c291f216eaac.gif)

![ezgif com-gif-maker (3)](https://user-images.githubusercontent.com/75416341/127144467-4444ec08-4adf-4551-9019-5ef181befee3.gif)

![ezgif com-gif-maker (5)](https://user-images.githubusercontent.com/75416341/127279848-2947909b-2dab-4ea2-bb72-949b8eb1ff49.gif)

![ezgif com-gif-maker (7)](https://user-images.githubusercontent.com/75416341/127285693-da95b549-ad31-46f6-9e8b-d155ac65a78c.gif)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 🙏 Acknowledgments

- Original greenhouse design and hardware setup
- ESP32 and Arduino community
- Home Assistant community









