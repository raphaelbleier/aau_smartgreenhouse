# System Architecture

This document describes the complete architecture of the AAU Smart Greenhouse system.

## Overview

The AAU Smart Greenhouse is a complete IoT solution consisting of four main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    AAU Smart Greenhouse                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │  ESP32  │          │   MQTT    │        │   Users   │
   │ Hardware│◄────────►│  Broker   │◄──────►│  Clients  │
   └─────────┘          └───────────┘        └───────────┘
        │                     │                     │
        │                     │              ┌──────┴──────┐
        │                     │              │             │
   ┌────▼────┐          ┌─────▼─────┐  ┌────▼───┐   ┌────▼────┐
   │ Sensors │          │  Backend  │  │  Web   │   │  Home   │
   │Actuators│          │    API    │  │  UI    │   │Assistant│
   └─────────┘          └───────────┘  └────────┘   └─────────┘
```

## Components

### 1. ESP32 Hardware (Embedded)

**Location**: Physical greenhouse  
**Technology**: C++/Arduino  
**File**: `Greenhouse_Struct_MQTT_V4.ino`

**Responsibilities:**
- Read sensor data (temperature, humidity, soil moisture, UV, light, etc.)
- Control actuators (lights, fans, servos, water pump)
- Publish sensor data to MQTT broker
- Subscribe to control commands from MQTT
- Implement automatic mode logic

**Communication:**
- Publishes to: `aau_gh/climate/*`
- Subscribes to: `aau_gh/manager/*`
- Protocol: MQTT over WiFi

**Sensors:**
- BMP280: Temperature, pressure, altitude
- DS18B20: Soil temperature
- Capacitive sensor: Soil moisture
- UVM30A: UV index
- FC-37: Rain detection
- LDR: Light intensity

**Actuators:**
- 230V lamp (via relay)
- Ventilation fan (via relay)
- Water pump (via relay)
- Servo motors (for vents/windows)

### 2. MQTT Broker (Message Bus)

**Technology**: Mosquitto  
**Protocol**: MQTT v3.1.1  
**Ports**: 1883 (MQTT), 9001 (WebSocket)

**Responsibilities:**
- Message routing between all components
- Topic-based publish/subscribe
- Persistent message storage
- WebSocket support for browser clients

**Topics:**
- `aau_gh/climate/getTemperature`
- `aau_gh/climate/getPressure`
- `aau_gh/climate/getSoilMoisture`
- `aau_gh/climate/getSoilTemp`
- `aau_gh/climate/getUV`
- `aau_gh/climate/getRain`
- `aau_gh/climate/getLux`
- `aau_gh/climate/getAltitude`
- `aau_gh/manager/lightbulb`
- `aau_gh/manager/ventilation`
- `aau_gh/manager/irrigation`
- `aau_gh/manager/automation`

### 3. Backend API (Application Server)

**Location**: Server/Docker container  
**Technology**: Node.js, Express  
**Files**: `backend/server.js`, `backend/package.json`  
**Port**: 3001

**Responsibilities:**
- REST API for data access and control
- MQTT client for bidirectional communication
- WebSocket server for real-time updates
- Data aggregation and caching
- Request validation

**REST API Endpoints:**
- `GET /api/status` - Server and MQTT status
- `GET /api/data` - All sensor data and device states
- `POST /api/control/lightbulb` - Control light
- `POST /api/control/ventilation` - Control ventilation
- `POST /api/control/irrigation` - Control irrigation
- `POST /api/control/automation` - Toggle automatic mode

**WebSocket:**
- URL: `ws://server:3001`
- Messages: Initial data + real-time updates

**Data Flow:**
```
MQTT → Backend → {
    Cache in memory
    Broadcast via WebSocket
    Serve via REST API
}
```

### 4. Web Frontend (User Interface)

**Technology**: React, Vite  
**Files**: `frontend/src/App.jsx`, `frontend/package.json`  
**Port**: 3000 (dev), 80 (production)

**Responsibilities:**
- Display sensor data in real-time
- Provide control interface for actuators
- Show connection status
- Responsive design for mobile/desktop

**Features:**
- 📊 Climate sensor dashboard
- 🎮 Device control panel
- 🔴 Live connection indicator
- 📱 Mobile-responsive design
- 🎨 Modern, gradient-based UI

**Communication:**
- REST API: Initial data fetch
- WebSocket: Real-time updates
- Axios: HTTP client

### 5. Home Assistant Integration

**Technology**: YAML configuration  
**Files**: `homeassistant/*.yaml`  
**Protocol**: MQTT

**Responsibilities:**
- Integrate with Home Assistant platform
- Provide entities for sensors and switches
- Enable automations based on sensor data
- Provide custom dashboard

**Entities:**
- 8 sensors (temperature, pressure, moisture, etc.)
- 4 switches (light, ventilation, irrigation, automation)
- Pre-configured automations
- Custom Lovelace dashboard

## Data Flow

### Sensor Reading Flow

```
1. ESP32 reads sensor
2. ESP32 publishes to MQTT: aau_gh/climate/getTemperature = "25.3"
3. MQTT broker distributes message
4. Backend receives message
5. Backend updates cache
6. Backend broadcasts via WebSocket
7. Frontend receives update
8. Home Assistant receives update
9. UI updates display
```

### Control Command Flow

```
1. User clicks button in Web UI
2. Frontend sends POST /api/control/lightbulb { state: "on" }
3. Backend validates request
4. Backend publishes to MQTT: aau_gh/manager/lightbulb = "on"
5. MQTT broker distributes message
6. ESP32 receives command
7. ESP32 activates relay
8. Light turns on
9. Backend updates cache
10. Backend broadcasts state change
11. Frontend updates button state
12. Home Assistant updates entity state
```

## Deployment Architectures

### Development Setup

```
┌─────────────────────────────────────────┐
│         Developer Machine                │
│  ┌──────────┐  ┌──────────┐            │
│  │ Backend  │  │ Frontend │            │
│  │ :3001    │  │  :3000   │            │
│  └────┬─────┘  └─────┬────┘            │
│       └────────┬─────┘                  │
│                │                         │
│         ┌──────▼──────┐                 │
│         │   MQTT      │                 │
│         │ (External)  │                 │
│         └─────────────┘                 │
└─────────────────────────────────────────┘
         │
         │ WiFi
         │
    ┌────▼─────┐
    │  ESP32   │
    └──────────┘
```

### Docker Deployment

```
┌─────────────────────────────────────────┐
│           Docker Host                    │
│  ┌──────────────────────────────────┐   │
│  │       docker-compose             │   │
│  │  ┌──────────┐  ┌──────────┐     │   │
│  │  │ Backend  │  │ Frontend │     │   │
│  │  │Container │  │ Container│     │   │
│  │  └────┬─────┘  └─────┬────┘     │   │
│  │       └────────┬─────┘           │   │
│  │                │                  │   │
│  │         ┌──────▼──────┐          │   │
│  │         │  Mosquitto  │          │   │
│  │         │  Container  │          │   │
│  │         └─────────────┘          │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
         │ Network
         │
    ┌────▼─────┐
    │  ESP32   │
    └──────────┘
```

### Production with Home Assistant

```
┌─────────────────────────────────────────────────────┐
│                 Home Network                         │
│  ┌────────────────┐    ┌──────────────────┐        │
│  │ Docker Stack   │    │ Home Assistant   │        │
│  │ ┌────────────┐ │    │ ┌──────────────┐ │        │
│  │ │ Backend    │ │    │ │ HA Core      │ │        │
│  │ │ Frontend   │ │    │ │ + MQTT       │ │        │
│  │ └─────┬──────┘ │    │ │ + Automations│ │        │
│  │       │        │    │ └──────┬───────┘ │        │
│  └───────┼────────┘    └────────┼──────────┘        │
│          │                      │                    │
│          └──────────┬───────────┘                    │
│                     │                                │
│              ┌──────▼──────┐                         │
│              │  Mosquitto  │                         │
│              │    Broker   │                         │
│              └─────────────┘                         │
└─────────────────────────────────────────────────────┘
         │
         │ WiFi
         │
    ┌────▼─────┐
    │  ESP32   │
    └──────────┘
```

## Security Considerations

### Network Security
- MQTT: Use authentication in production
- Web UI: Deploy behind HTTPS
- Firewall: Limit exposed ports
- VPN: Consider for remote access

### Application Security
- Input validation on all API endpoints
- MQTT ACL for topic permissions
- Rate limiting on API endpoints
- Security headers on web server

### IoT Security
- WiFi: Use WPA2/WPA3
- OTA updates: Secure firmware updates
- Device authentication: MQTT credentials
- Physical security: Protect hardware access

## Monitoring & Maintenance

### Logs
- Backend: `journalctl -u greenhouse-backend -f`
- Docker: `docker-compose logs -f`
- MQTT: `/mosquitto/log/mosquitto.log`

### Health Checks
- Backend: `GET /api/status`
- MQTT: `mosquitto_sub -h localhost -t "aau_gh/#" -v`
- Frontend: Browser developer console

### Backup
- MQTT data: `/mosquitto/data/`
- Configuration files: All YAML files
- ESP32 firmware: `Greenhouse_Struct_MQTT_V4.ino`

## Scalability

### Horizontal Scaling
- Multiple backend instances with load balancer
- MQTT clustering for high availability
- Redis for shared session state

### Vertical Scaling
- Increase container resources
- Database for historical data
- Time-series database (InfluxDB) for analytics

## Future Enhancements

- 📱 Mobile app (React Native)
- 📊 Historical data visualization
- 🤖 Machine learning for predictive automation
- 📧 Email/SMS alerts
- 📷 Camera integration
- 🌍 Multi-greenhouse support
- 📈 Analytics dashboard
- 🔌 Plugin system for additional sensors

## Troubleshooting

### Common Issues

1. **ESP32 won't connect to MQTT**
   - Check WiFi credentials
   - Verify MQTT broker accessibility
   - Check firewall rules

2. **Frontend shows no data**
   - Verify backend is running
   - Check WebSocket connection
   - Inspect browser console

3. **Home Assistant entities unavailable**
   - Check MQTT configuration
   - Verify topic names match
   - Restart Home Assistant

4. **High latency**
   - Check network bandwidth
   - Verify MQTT QoS settings
   - Consider local MQTT broker

## References

- [MQTT Protocol](https://mqtt.org/)
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [React Documentation](https://react.dev/)
- [Home Assistant MQTT](https://www.home-assistant.io/integrations/mqtt/)
- [Docker Documentation](https://docs.docker.com/)

---

For more information, see the [README.md](README.md)
