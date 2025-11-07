# AAU Smart Greenhouse - Home Assistant Integration

This directory contains the configuration files for integrating the AAU Smart Greenhouse with Home Assistant.

## Setup Instructions

### 1. MQTT Configuration

Add the following to your Home Assistant `configuration.yaml`:

```yaml
# MQTT Broker Configuration
mqtt:
  broker: broker.hivemq.com  # Or your own MQTT broker
  port: 1883
  username: ""  # If required
  password: ""  # If required
```

### 2. Sensors Configuration

Copy the contents of `sensors.yaml` to your Home Assistant configuration:

```yaml
# Add to configuration.yaml
sensor: !include sensors.yaml
```

Or merge the sensor definitions from `sensors.yaml` into your existing sensor configuration.

### 3. Switches Configuration

Copy the contents of `switches.yaml` to your Home Assistant configuration:

```yaml
# Add to configuration.yaml
switch: !include switches.yaml
```

### 4. Automation (Optional)

The `automations.yaml` file contains example automations for the greenhouse. You can add these to your Home Assistant automations.

### 5. Dashboard

Use the Lovelace dashboard configuration in `dashboard.yaml` to create a nice UI for your greenhouse in Home Assistant.

## Features

- **Real-time Sensor Monitoring**: Temperature, humidity, soil moisture, UV index, rain, and more
- **Device Control**: Control lights, ventilation, and irrigation remotely
- **Automation**: Set up automated responses based on sensor readings
- **Alerts**: Get notified when conditions are outside acceptable ranges

## Customization

You can customize the MQTT topics and device names by editing the YAML files. Make sure to match the topics used by the ESP32 firmware.
