# Docker Deployment Guide 🐳

This guide explains how to deploy the AAU Smart Greenhouse using Docker and Docker Compose.

## Prerequisites

- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/raphaelbleier/aau_smartgreenhouse.git
cd aau_smartgreenhouse
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- **Mosquitto MQTT Broker** on port 1883 (MQTT) and 9001 (WebSocket)
- **Backend API Server** on port 3001
- **Frontend Web Interface** on port 3000

### 3. Access the Dashboard

Open your browser to: **http://localhost:3000**

### 4. Configure ESP32

Update the ESP32 firmware to connect to your local MQTT broker:

```cpp
EspMQTTClient client(
  "YOUR_WIFI_SSID",
  "YOUR_WIFI_PASSWORD",
  "YOUR_DOCKER_HOST_IP",  // e.g., "192.168.1.100"
  "",
  "",
  "greenhouse_client",
  1883
);
```

## Service Details

### MQTT Broker (Mosquitto)

- **MQTT Port**: 1883
- **WebSocket Port**: 9001
- **Configuration**: `docker/mosquitto/config/mosquitto.conf`
- **Data**: Persisted in Docker volume
- **Logs**: `docker/mosquitto/log/`

### Backend API

- **Port**: 3001
- **Environment Variables**:
  - `PORT`: API server port (default: 3001)
  - `MQTT_BROKER`: MQTT broker URL (default: mqtt://mosquitto:1883)

### Frontend

- **Port**: 3000 (served by Nginx)
- **Reverse Proxy**: Automatically proxies `/api` to backend
- **WebSocket**: Automatically proxies WebSocket connections

## Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mosquitto
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

### Rebuild Images

```bash
docker-compose build
docker-compose up -d
```

## Production Deployment

### 1. Enable MQTT Authentication

Edit `docker/mosquitto/config/mosquitto.conf`:

```conf
allow_anonymous false
password_file /mosquitto/config/passwd
```

Create password file:

```bash
docker exec -it greenhouse-mqtt mosquitto_passwd -c /mosquitto/config/passwd username
```

### 2. Use Environment Variables

Create `.env` file:

```env
MQTT_BROKER=mqtt://mosquitto:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
PORT=3001
```

Update `docker-compose.yml` to use the `.env` file.

### 3. Enable HTTPS

Use a reverse proxy like Nginx or Traefik with Let's Encrypt.

### 4. Secure the Deployment

- Use strong passwords for MQTT
- Enable firewall rules
- Use HTTPS for web interface
- Implement rate limiting
- Regular security updates

## Networking

### Access from Same Network

The services are accessible on:
- Frontend: `http://<docker-host-ip>:3000`
- Backend API: `http://<docker-host-ip>:3001`
- MQTT Broker: `mqtt://<docker-host-ip>:1883`

### Access from Internet

You'll need to:
1. Configure port forwarding on your router
2. Use a dynamic DNS service (e.g., DuckDNS)
3. Set up HTTPS with Let's Encrypt
4. Consider using a VPN for secure access

## Troubleshooting

### Services won't start

```bash
# Check if ports are already in use
netstat -tuln | grep -E '1883|3001|3000|9001'

# Check Docker logs
docker-compose logs
```

### MQTT connection issues

```bash
# Test MQTT broker
mosquitto_sub -h localhost -t "aau_gh/#" -v

# Check if broker is running
docker-compose ps
```

### Frontend can't connect to backend

```bash
# Check backend logs
docker-compose logs backend

# Verify network connectivity
docker-compose exec frontend ping backend
```

### ESP32 can't connect to MQTT

- Ensure ESP32 and Docker host are on the same network
- Use the Docker host's IP address, not `localhost`
- Check firewall rules
- Verify MQTT broker is accessible: `telnet <docker-host-ip> 1883`

## Maintenance

### Backup Data

```bash
# Backup MQTT data
docker cp greenhouse-mqtt:/mosquitto/data ./backup/mqtt-data

# Or use Docker volumes
docker run --rm -v aau_smartgreenhouse_mosquitto_data:/data -v $(pwd):/backup alpine tar czf /backup/mqtt-backup.tar.gz -C /data .
```

### Update Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Monitor Resource Usage

```bash
docker stats
```

## Advanced Configuration

### Custom Backend Port

Edit `docker-compose.yml`:

```yaml
backend:
  ports:
    - "8080:3001"  # Map to different host port
```

### Multiple Instances

You can run multiple instances by changing the ports and container names in `docker-compose.yml`.

---

For more information, see the main [README.md](README.md)
