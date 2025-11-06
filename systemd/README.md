# Systemd Service Setup

This guide explains how to set up the AAU Smart Greenhouse as a systemd service on Linux.

## Prerequisites

- Linux system with systemd
- Node.js installed
- Mosquitto MQTT broker installed

## Installation Steps

### 1. Create User

```bash
sudo useradd -r -s /bin/false greenhouse
```

### 2. Install Application

```bash
# Clone repository
sudo mkdir -p /opt/aau_smartgreenhouse
cd /opt/aau_smartgreenhouse
sudo git clone https://github.com/raphaelbleier/aau_smartgreenhouse.git .

# Install dependencies
cd backend
sudo npm install --production

# Set permissions
sudo chown -R greenhouse:greenhouse /opt/aau_smartgreenhouse
```

### 3. Install Mosquitto

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients

# Enable and start
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

### 4. Configure Backend

```bash
sudo cp /opt/aau_smartgreenhouse/backend/.env.example /opt/aau_smartgreenhouse/backend/.env
sudo nano /opt/aau_smartgreenhouse/backend/.env
```

Edit as needed:
```env
PORT=3001
MQTT_BROKER=mqtt://localhost:1883
```

### 5. Install Systemd Service

```bash
sudo cp /opt/aau_smartgreenhouse/systemd/greenhouse-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable greenhouse-backend
sudo systemctl start greenhouse-backend
```

### 6. Verify Service

```bash
sudo systemctl status greenhouse-backend
journalctl -u greenhouse-backend -f
```

## Service Management

### Start Service

```bash
sudo systemctl start greenhouse-backend
```

### Stop Service

```bash
sudo systemctl stop greenhouse-backend
```

### Restart Service

```bash
sudo systemctl restart greenhouse-backend
```

### Enable on Boot

```bash
sudo systemctl enable greenhouse-backend
```

### Disable on Boot

```bash
sudo systemctl disable greenhouse-backend
```

### View Logs

```bash
# Real-time logs
journalctl -u greenhouse-backend -f

# Last 100 lines
journalctl -u greenhouse-backend -n 100

# Since last boot
journalctl -u greenhouse-backend -b
```

## Frontend Setup

For the frontend, you can:

### Option 1: Serve with Nginx

```bash
# Build frontend
cd /opt/aau_smartgreenhouse/frontend
npm install
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/greenhouse/

# Configure Nginx
sudo nano /etc/nginx/sites-available/greenhouse
```

Nginx config:
```nginx
server {
    listen 80;
    server_name greenhouse.local;
    root /var/www/html/greenhouse;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/greenhouse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Use the Development Server

You can also run the frontend dev server as a systemd service (not recommended for production).

## Troubleshooting

### Service won't start

```bash
# Check status
sudo systemctl status greenhouse-backend

# Check logs
journalctl -u greenhouse-backend -n 50

# Verify user permissions
sudo -u greenhouse /usr/bin/node /opt/aau_smartgreenhouse/backend/server.js
```

### MQTT connection issues

```bash
# Test MQTT
mosquitto_sub -h localhost -t "aau_gh/#" -v

# Check Mosquitto status
sudo systemctl status mosquitto
```

### Permission errors

```bash
sudo chown -R greenhouse:greenhouse /opt/aau_smartgreenhouse
sudo chmod -R 755 /opt/aau_smartgreenhouse
```

## Security Considerations

1. **Firewall**: Only expose necessary ports
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 3001/tcp  # If accessing backend directly
   ```

2. **HTTPS**: Use Let's Encrypt for SSL
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d greenhouse.yourdomain.com
   ```

3. **MQTT Authentication**: Configure Mosquitto with passwords
   ```bash
   sudo mosquitto_passwd -c /etc/mosquitto/passwd greenhouse_user
   ```

## Updates

To update the application:

```bash
cd /opt/aau_smartgreenhouse
sudo git pull
cd backend
sudo npm install --production
sudo systemctl restart greenhouse-backend
```

---

For more information, see the main [README.md](../README.md)
