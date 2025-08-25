import { Request, Response } from 'express';
import { MqttService } from '../services/mqtt.service';
import { AppDataSource } from '../config';
import { Device } from '../entities/device.entity';

export class MqttController {
  private readonly mqttService: MqttService;
  
  private readonly deviceRepository;

  constructor() {
    this.mqttService = new MqttService();
    this.deviceRepository = AppDataSource.getRepository(Device);
    
    // Bind methods to preserve 'this' context
    this.startMqttService = this.startMqttService.bind(this);
    this.getDeviceData = this.getDeviceData.bind(this);
  }
  
  /**
   * Start the MQTT service to connect to broker and subscribe to topics
   */
  async startMqttService(req: Request, res: Response): Promise<Response> {
    try {
      await this.mqttService.mqttData();
      
      return res.status(200).json({
        success: true,
        message: 'MQTT service started and connected to broker'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to start MQTT service'
      });
    }
  }
  

  
  /**
   * Get device data from the database
   */
  async getDeviceData(req: Request, res: Response): Promise<Response> {
    try {
      const deviceId = req.params.deviceId;
      const { zoneName } = req.query;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      // Ensure deviceId has leading zeros if needed (5 digits)
      const deviceIdStr = deviceId.padStart(5, '0');
      
      // Find the device
      const device = await this.deviceRepository.findOne({
        where: { deviceId: deviceIdStr },
        relations: ['zones'],
      });
      
      if (!device || !device.metadata) {
        return res.status(404).json({
          success: false,
          message: 'Device data not found'
        });
      }
      
      // If zone name is provided, return zone-specific data
      if (zoneName && device.metadata[zoneName as string]) {
        return res.status(200).json({
          success: true,
          data: device.metadata[zoneName as string]
        });
      }
      
      // Return all device metadata
      return res.status(200).json({
        success: true,
        data: device.metadata
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}