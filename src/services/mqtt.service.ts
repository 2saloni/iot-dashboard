import { connect, MqttClient } from 'mqtt';
import { Device } from '../entities/device.entity';
import { Zone } from '../entities/zone.entity';
import { DataSource, Repository } from 'typeorm';
import { Singleton } from '../decorators/singleton.decorator';

@Singleton
export class MqttService {
  private mqttClient: MqttClient | null = null;
  private deviceRepository: Repository<Device>;
  private zoneRepository: Repository<Zone>;
  
  constructor(private dataSource: DataSource) {
    this.deviceRepository = this.dataSource.getRepository(Device);
    this.zoneRepository = this.dataSource.getRepository(Zone);
  }

  /**
   * Connect to MQTT broker
   */
  async connect(url: string = 'mqtt://localhost:1883'): Promise<boolean> {
    try {
      this.mqttClient = connect(url, {
        clientId: `mqtt_client_${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });
      
      this.mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.subscribeToAllDevices();
      });
      
      this.mqttClient.on('error', (err) => {
        console.error('MQTT connection error:', err);
      });
      
      this.mqttClient.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to a specific topic
   */
  subscribeTopic(topic: string): boolean {
    if (!this.mqttClient) {
      console.error('MQTT client not connected');
      return false;
    }
    
    this.mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Error subscribing to ${topic}:`, err);
        return false;
      }
      console.log(`Subscribed to ${topic}`);
    });
    
    return true;
  }
  
  /**
   * Subscribe to all device topics based on device IDs and zone names
   */
  async subscribeToAllDevices(): Promise<void> {
    try {
      // Get all devices with their zones
      const devices = await this.deviceRepository.find({
        relations: ['zones'],
      });
      
      for (const device of devices) {
        // Subscribe to the base device topic
        // const deviceTopic = `device/${device.deviceId}/#`;
        // this.subscribeTopic(deviceTopic);
        
        // Subscribe to zone-specific topics
        if (device.zones && device.zones.length > 0) {
          for (const zone of device.zones) {
            const zoneTopic = `device/${device.deviceId}/zone/${zone.name}`;
            this.subscribeTopic(zoneTopic);
          }
        }
      }
    } catch (error) {
      console.error('Error subscribing to device topics:', error);
    }
  }
  
  /**
   * Handle incoming MQTT messages
   */
  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      console.log(`Message received on ${topic}: ${message.toString()}`);
      
      // Parse topic to extract device ID and possibly zone name
      // Expected format: device/{deviceId}/[zone/{zoneName}]
      const topicParts = topic.split('/');
      
      if (topicParts.length >= 2 && topicParts[0] === 'device') {
        const deviceId = parseInt(topicParts[1], 10);
        let zoneName = null;
        
        if (topicParts.length >= 4 && topicParts[2] === 'zone') {
          zoneName = topicParts[3];
        }
        
        // Store the data in the database
        await this.storeDeviceData(deviceId, zoneName, message.toString());
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }
  
  /**
   * Store device data in the database
   */
  private async storeDeviceData(deviceId: number, zoneName: string | null, data: string): Promise<void> {
    try {
      // Find the device
      const device = await this.deviceRepository.findOne({
        where: { deviceId: deviceId.toString() },
        relations: ['zones'],
      });
      
      if (!device) {
        console.error(`Device with ID ${deviceId} not found`);
        return;
      }
      
      // Parse the data (assuming it's JSON)
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        parsedData = { rawValue: data };
      }
      
      // Update device metadata
      if (!device.metadata) {
        device.metadata = {};
      }
      
      // If zone name is provided, update zone-specific data
      if (zoneName) {
        const zone = device.zones?.find(z => z.name === zoneName);
        
        if (zone) {
          // Store the data in the device's metadata under the zone name
          device.metadata[zoneName] = {
            ...device.metadata[zoneName],
            ...parsedData,
            lastUpdated: new Date()
          };
        } else {
          console.error(`Zone ${zoneName} not found for device ${deviceId}`);
        }
      } else {
        // Store device-level data
        device.metadata = {
          ...device.metadata,
          ...parsedData,
          lastUpdated: new Date()
        };
      }
      
      // Save the updated device
      await this.deviceRepository.save(device);
    } catch (error) {
      console.error('Error storing device data:', error);
    }
  }
  
  /**
   * Publish message to a topic
   */
  publishMessage(topic: string, message: string): boolean {
    if (!this.mqttClient) {
      console.error('MQTT client not connected');
      return false;
    }
    
    this.mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.error(`Error publishing to ${topic}:`, err);
        return false;
      }
      console.log(`Published to ${topic}: ${message}`);
    });
    
    return true;
  }
  
  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.mqttClient) {
      this.mqttClient.end();
      this.mqttClient = null;
      console.log('Disconnected from MQTT broker');
    }
  }
}