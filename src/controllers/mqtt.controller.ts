import { Request, Response } from 'express';
import { MqttService } from '../services/mqtt.service';
import { DataSource } from 'typeorm';
import { Device } from '../entities/device.entity';
import { Zone } from '../entities/zone.entity';

export class MqttController {
  private mqttService: MqttService;
  private deviceRepository: DataSource['manager']['getRepository'];
  
  constructor(private dataSource: DataSource) {
    this.mqttService = new MqttService(dataSource);
    this.deviceRepository = this.dataSource.getRepository;
  }
  
  /**
   * Initialize MQTT connection
   */
  async initMqttConnection(req: Request, res: Response): Promise<Response> {
    try {
      // Get MQTT broker URL from request body or use default
      const { brokerUrl } = req.body;
      
      const connected = await this.mqttService.connect(brokerUrl);
      
      if (connected) {
        return res.status(200).json({
          success: true,
          message: 'MQTT connection established successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to connect to MQTT broker'
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  /**
   * Subscribe to a specific topic
   */
  async subscribeTopic(req: Request, res: Response): Promise<Response> {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({
          success: false,
          message: 'Topic is required'
        });
      }
      
      const subscribed = this.mqttService.subscribeTopic(topic);
      
      if (subscribed) {
        return res.status(200).json({
          success: true,
          message: `Subscribed to topic: ${topic}`
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to subscribe to topic'
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  /**
   * Subscribe to all device topics
   */
  async subscribeAllDevices(req: Request, res: Response): Promise<Response> {
    try {
      await this.mqttService.subscribeToAllDevices();
      
      return res.status(200).json({
        success: true,
        message: 'Subscribed to all device topics'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  /**
   * Publish message to a topic
   */
  async publishMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { topic, message } = req.body;
      
      if (!topic || !message) {
        return res.status(400).json({
          success: false,
          message: 'Topic and message are required'
        });
      }
      
      const published = this.mqttService.publishMessage(topic, message);
      
      if (published) {
        return res.status(200).json({
          success: true,
          message: `Message published to topic: ${topic}`
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to publish message'
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}