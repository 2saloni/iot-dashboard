import mqtt, { MqttClient } from "mqtt";
import { Singleton } from "../decorators/singleton.decorator";
import { Repository } from "typeorm";
import { Device } from "../entities/device.entity";
import { AppDataSource } from "../config";



@Singleton
export class MqttService {

    private readonly deviceRepository: Repository<Device>;
    private mqttClient: MqttClient | null = null;

    constructor() {
        this.deviceRepository = AppDataSource.getRepository(Device);
    }

    async mqttData(): Promise<void> {
      await this.connectToMqtt();
    }

    private async connectToMqtt(): Promise<void> {
      try {
        const url: string = process.env.MQTT_BROKER_URL!;
        if (!url) throw new Error("MQTT_BROKER_URL is not set");

        // connect via module, store on the instance
        this.mqttClient = mqtt.connect(url, {
          username: process.env.MQTT_USERNAME || undefined,
          password: process.env.MQTT_PASSWORD || undefined,
          clientId: `ingestor_${Math.random().toString(16).slice(2, 10)}`,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 1500,
        });

        // build topics
        const topics: string[] = await this.buildTopic();

        this.mqttClient!.on('message', (topic, message) => {
          this.topicData(topic, message);
        });

        this.mqttClient.on('connect', () => {
          if (topics.length === 0) {
            console.log('No topics found');
          }
          this.mqttClient!.subscribe(topics, (err) => {
            if (!err) {
              console.log("📡 Subscribed to topic:", topics);
            }
          });
          // this.mqttClient!.on('message', (topic, message) => {
          //   this.topicData(topic, message);
          // });
        });

      } catch (error) {
        console.error('Error connecting to MQTT broker', error);
      }

    }

    private async buildTopic(): Promise<string[]> {
      try {
        //Get all devices with their zones
        const devices: Device[] = await this.deviceRepository.find({
          relations: ['zones'],
        });
      
        const topics: string[] = [];
        for (const device of devices) {
          // Subscribe to device-specific topics
          if (device.zones && device.zones.length > 0) {
            for (const zone of device.zones) {
              // Format: 00001Zone1 - deviceId followed by zoneName
              topics.push(`${device.deviceId}${zone.name}`);
            }
          } 
        }
        return topics;
      } catch (error) {
        console.error('Error building topic', error);
        return [];
      }
    }

    private async topicData(topic: string, message: Buffer): Promise<void> {
      try {
        // Parse topic: 5 digits for deviceId + optional zone name
        const deviceTopic = topic.match(/^(\d{5})([A-Za-z][\w-]*)?$/);
        if (!deviceTopic) {
          // Ignore topics that don't match our convention
          return;
        }
        const deviceIdStr = deviceTopic[1];   // "00001"
        const zoneName = deviceTopic[2];      // "Zone1" | undefined
    
        // Parse payload (JSON preferred; fallback to raw string)
        let data: Record<string, any>;
        try {
          data = JSON.parse(message.toString());
        } catch {
          data = { raw: message.toString() };
        }
    
        // Load the device
        const device = await this.deviceRepository.findOne({
          where: { deviceId: deviceIdStr },
          relations: ["zones"],
        });
        if (!device) {
          console.log(`Device not found for id ${deviceIdStr} (topic: ${topic})`);
          return;
        }
    
        // Merge into metadata
        device.metadata = device.metadata ?? {};
        const now = new Date();
    
        if (zoneName) {
          device.metadata[zoneName] = {
            ...(device.metadata[zoneName] ?? {}),
            ...data,
            lastUpdated: now,
          };
        } else {
          device.metadata = {
            ...device.metadata,
            ...data,
            lastUpdated: now,
          };
        }
    
        await this.deviceRepository.save(device);
      } catch (error) {
        console.error("Error processing topic data", error);
      }
    }
}