import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    // Fetch initial data
    fetchData()
    
    // Setup WebSocket connection for real-time updates
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:3001`;
    const websocket = new WebSocket(wsUrl)
    
    websocket.onopen = () => {
      console.log('WebSocket connected')
      setStatus('connected')
    }
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'initial' || message.type === 'update') {
        setData(message.data)
      }
    }
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setStatus('error')
    }
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected')
      setStatus('disconnected')
    }
    
    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data')
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleControl = async (device, state) => {
    try {
      await axios.post(`/api/control/${device}`, { state })
      fetchData()
    } catch (error) {
      console.error(`Error controlling ${device}:`, error)
    }
  }

  const toggleDevice = (device, currentState) => {
    const newState = currentState === 'on' ? 'off' : 'on'
    handleControl(device, newState)
  }

  if (!data) {
    return (
      <div className="app loading">
        <h1>🌱 AAU Smart Greenhouse</h1>
        <p>Loading...</p>
      </div>
    )
  }

  const { climate, manager } = data

  return (
    <div className="app">
      <header className="header">
        <h1>🌱 AAU Smart Greenhouse Dashboard</h1>
        <div className={`status ${status}`}>
          <span className="status-dot"></span>
          {status === 'connected' ? 'Live' : status}
        </div>
      </header>

      <div className="container">
        {/* Climate Sensors */}
        <section className="section">
          <h2>📊 Climate Sensors</h2>
          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">🌡️</div>
              <div className="card-label">Temperature</div>
              <div className="card-value">
                {climate.temperature?.toFixed(1) ?? '--'} °C
              </div>
            </div>

            <div className="card">
              <div className="card-icon">💨</div>
              <div className="card-label">Pressure</div>
              <div className="card-value">
                {climate.pressure ? (climate.pressure / 100).toFixed(0) : '--'} hPa
              </div>
            </div>

            <div className="card">
              <div className="card-icon">⛰️</div>
              <div className="card-label">Altitude</div>
              <div className="card-value">
                {climate.altitude?.toFixed(0) ?? '--'} m
              </div>
            </div>

            <div className="card">
              <div className="card-icon">🌡️</div>
              <div className="card-label">Soil Temperature</div>
              <div className="card-value">
                {climate.soilTemp?.toFixed(1) ?? '--'} °C
              </div>
            </div>

            <div className="card">
              <div className="card-icon">💧</div>
              <div className="card-label">Soil Moisture</div>
              <div className="card-value">
                {climate.soilMoisture?.toFixed(0) ?? '--'} %
              </div>
              <div className="card-bar">
                <div 
                  className="card-bar-fill" 
                  style={{ width: `${climate.soilMoisture || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="card">
              <div className="card-icon">☀️</div>
              <div className="card-label">UV Index</div>
              <div className="card-value">
                {climate.uv?.toFixed(1) ?? '--'}
              </div>
            </div>

            <div className="card">
              <div className="card-icon">🌧️</div>
              <div className="card-label">Rain</div>
              <div className="card-value">
                {climate.rain?.toFixed(0) ?? '--'} %
              </div>
            </div>

            <div className="card">
              <div className="card-icon">💡</div>
              <div className="card-label">Light Intensity</div>
              <div className="card-value">
                {climate.lux?.toFixed(0) ?? '--'} %
              </div>
              <div className="card-bar">
                <div 
                  className="card-bar-fill" 
                  style={{ width: `${climate.lux || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          {climate.lastUpdate && (
            <p className="last-update">
              Last update: {new Date(climate.lastUpdate).toLocaleString()}
            </p>
          )}
        </section>

        {/* Control Panel */}
        <section className="section">
          <h2>🎮 Control Panel</h2>
          <div className="controls-grid">
            <div className="control-card">
              <div className="control-header">
                <span className="control-icon">🤖</span>
                <span className="control-label">Automatic Mode</span>
              </div>
              <button
                className={`control-button ${manager.automation === 'on' ? 'active' : ''}`}
                onClick={() => toggleDevice('automation', manager.automation)}
              >
                {manager.automation === 'on' ? 'ON' : 'OFF'}
              </button>
              <p className="control-description">
                Automatically manages temperature and irrigation
              </p>
            </div>

            <div className="control-card">
              <div className="control-header">
                <span className="control-icon">💡</span>
                <span className="control-label">Light</span>
              </div>
              <button
                className={`control-button ${manager.lightbulb === 'on' ? 'active' : ''}`}
                onClick={() => toggleDevice('lightbulb', manager.lightbulb)}
              >
                {manager.lightbulb === 'on' ? 'ON' : 'OFF'}
              </button>
              <p className="control-description">
                230V lamp for supplemental lighting
              </p>
            </div>

            <div className="control-card">
              <div className="control-header">
                <span className="control-icon">🌀</span>
                <span className="control-label">Ventilation</span>
              </div>
              <button
                className={`control-button ${manager.ventilation === 'on' ? 'active' : ''}`}
                onClick={() => toggleDevice('ventilation', manager.ventilation)}
              >
                {manager.ventilation === 'on' ? 'ON' : 'OFF'}
              </button>
              <p className="control-description">
                Fan and servo for air circulation
              </p>
            </div>

            <div className="control-card">
              <div className="control-header">
                <span className="control-icon">💧</span>
                <span className="control-label">Irrigation</span>
              </div>
              <button
                className={`control-button ${manager.irrigation === 'on' ? 'active' : ''}`}
                onClick={() => toggleDevice('irrigation', manager.irrigation)}
              >
                {manager.irrigation === 'on' ? 'ON' : 'OFF'}
              </button>
              <p className="control-description">
                Water pump for soil irrigation
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>AAU Smart Greenhouse - IoT Monitoring System</p>
      </footer>
    </div>
  )
}

export default App
