# Quick Start Guide 🚀

Get your AAU Smart Greenhouse up and running in minutes!

## Prerequisites

✅ Node.js v16+ installed  
✅ Arduino IDE installed (for ESP32)  
✅ MQTT broker accessible (HiveMQ public broker works by default)  

## Step 1: Clone the Repository

```bash
git clone https://github.com/raphaelbleier/aau_smartgreenhouse.git
cd aau_smartgreenhouse
```

## Step 2: Install Dependencies

```bash
# Install all dependencies at once
npm run install-all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

## Step 3: Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed (default settings work with HiveMQ public broker):
```env
PORT=3001
MQTT_BROKER=mqtt://broker.hivemq.com
```

## Step 4: Configure and Flash ESP32

1. Open Arduino IDE
2. Install ESP32 board support (see main README for libraries)
3. Open `Greenhouse_Struct_MQTT_V4.ino`
4. Update WiFi credentials (lines 30-31):
   ```cpp
   "YOUR_WIFI_SSID",
   "YOUR_WIFI_PASSWORD",
   ```
5. Flash to ESP32

## Step 5: Start the Application

### Option A: Run Both (Recommended)

```bash
# From project root
npm run dev
```

This starts both backend and frontend simultaneously!

### Option B: Run Separately

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Step 6: Access the Dashboard

Open your browser to: **http://localhost:3000**

You should see:
- 🟢 Live connection status
- 📊 Real-time sensor data
- 🎮 Control panel for devices

## Step 7: (Optional) Set Up Home Assistant

If you use Home Assistant:

1. Ensure MQTT is configured in Home Assistant
2. Copy files from `homeassistant/` to your HA config
3. Add sensor and switch includes to `configuration.yaml`
4. Restart Home Assistant
5. Create dashboard using `dashboard.yaml`

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify MQTT broker is accessible: `telnet broker.hivemq.com 1883`

### Frontend won't load
- Check if backend is running on port 3001
- Clear browser cache
- Check browser console for errors

### ESP32 not connecting
- Verify WiFi credentials are correct
- Check if MQTT broker is accessible from ESP32 network
- Monitor Serial output (9600 baud) for debug messages

### No sensor data showing
- Ensure ESP32 is powered and connected
- Check MQTT topics match in all configurations
- Verify sensors are properly wired

## Next Steps

✨ Customize the dashboard  
🤖 Enable automatic mode  
🏠 Integrate with Home Assistant  
📱 Access remotely (setup port forwarding or VPN)  

## Need Help?

Check the full [README.md](README.md) for detailed documentation!

---

Happy Gardening! 🌱
