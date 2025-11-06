const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const mqttClient = mqtt.connect(MQTT_BROKER, {
  clientId: `greenhouse_backend_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

// Store latest sensor data
let greenhouseData = {
  climate: {
    temperature: null,
    pressure: null,
    altitude: null,
    soilTemp: null,
    soilMoisture: null,
    uv: null,
    rain: null,
    lux: null,
    lastUpdate: null
  },
  manager: {
    lightbulb: 'off',
    ventilation: 'off',
    irrigation: 'off',
    automation: 'off'
  }
};

// MQTT Connection handlers
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Subscribe to all greenhouse topics
  mqttClient.subscribe('aau_gh/#', (err) => {
    if (err) {
      console.error('Failed to subscribe:', err);
    } else {
      console.log('Subscribed to aau_gh/# topics');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  const value = message.toString();
  console.log(`Received: ${topic} = ${value}`);
  
  // Parse climate data
  if (topic === 'aau_gh/climate/getTemperature') {
    greenhouseData.climate.temperature = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getPressure') {
    greenhouseData.climate.pressure = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getAltitude') {
    greenhouseData.climate.altitude = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getSoilTemp') {
    greenhouseData.climate.soilTemp = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getSoilMoisture') {
    greenhouseData.climate.soilMoisture = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getUV') {
    greenhouseData.climate.uv = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getRain') {
    greenhouseData.climate.rain = parseFloat(value);
  } else if (topic === 'aau_gh/climate/getLux') {
    greenhouseData.climate.lux = parseFloat(value);
  }
  
  greenhouseData.climate.lastUpdate = new Date().toISOString();
  
  // Broadcast to WebSocket clients
  broadcastToClients({ type: 'update', data: greenhouseData });
});

mqttClient.on('error', (error) => {
  console.error('MQTT Error:', error);
});

// REST API Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected'
  });
});

app.get('/api/data', (req, res) => {
  res.json(greenhouseData);
});

app.post('/api/control/lightbulb', (req, res) => {
  const { state } = req.body; // 'on' or 'off'
  if (state !== 'on' && state !== 'off') {
    return res.status(400).json({ error: 'State must be "on" or "off"' });
  }
  
  mqttClient.publish('aau_gh/manager/lightbulb', state);
  greenhouseData.manager.lightbulb = state;
  res.json({ success: true, lightbulb: state });
});

app.post('/api/control/ventilation', (req, res) => {
  const { state } = req.body;
  if (state !== 'on' && state !== 'off') {
    return res.status(400).json({ error: 'State must be "on" or "off"' });
  }
  
  mqttClient.publish('aau_gh/manager/ventilation', state);
  greenhouseData.manager.ventilation = state;
  res.json({ success: true, ventilation: state });
});

app.post('/api/control/irrigation', (req, res) => {
  const { state } = req.body;
  if (state !== 'on' && state !== 'off') {
    return res.status(400).json({ error: 'State must be "on" or "off"' });
  }
  
  mqttClient.publish('aau_gh/manager/irrigation', state);
  greenhouseData.manager.irrigation = state;
  res.json({ success: true, irrigation: state });
});

app.post('/api/control/automation', (req, res) => {
  const { state } = req.body;
  if (state !== 'on' && state !== 'off') {
    return res.status(400).json({ error: 'State must be "on" or "off"' });
  }
  
  mqttClient.publish('aau_gh/manager/automation', state);
  greenhouseData.manager.automation = state;
  res.json({ success: true, automation: state });
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  // Send current data to new client
  ws.send(JSON.stringify({ type: 'initial', data: greenhouseData }));
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

function broadcastToClients(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  mqttClient.end();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
