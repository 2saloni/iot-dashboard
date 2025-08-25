"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttController = void 0;
const mqtt_service_1 = require("../services/mqtt.service");
const config_1 = require("../config");
const device_entity_1 = require("../entities/device.entity");
class MqttController {
    constructor() {
        this.mqttService = new mqtt_service_1.MqttService();
        this.deviceRepository = config_1.AppDataSource.getRepository(device_entity_1.Device);
        // Bind methods to preserve 'this' context
        this.startMqttService = this.startMqttService.bind(this);
        this.getDeviceData = this.getDeviceData.bind(this);
    }
    /**
     * Start the MQTT service to connect to broker and subscribe to topics
     */
    async startMqttService(req, res) {
        try {
            await this.mqttService.mqttData();
            return res.status(200).json({
                success: true,
                message: 'MQTT service started and connected to broker'
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to start MQTT service'
            });
        }
    }
    /**
     * Get device data from the database
     */
    async getDeviceData(req, res) {
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
            if (zoneName && device.metadata[zoneName]) {
                return res.status(200).json({
                    success: true,
                    data: device.metadata[zoneName]
                });
            }
            // Return all device metadata
            return res.status(200).json({
                success: true,
                data: device.metadata
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
}
exports.MqttController = MqttController;
