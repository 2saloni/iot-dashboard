"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttController = void 0;
const mqtt_service_1 = require("../services/mqtt.service");
class MqttController {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.mqttService = new mqtt_service_1.MqttService(dataSource);
        this.deviceRepository = this.dataSource.getRepository;
    }
    /**
     * Initialize MQTT connection
     */
    async initMqttConnection(req, res) {
        try {
            // Get MQTT broker URL from request body or use default
            const { brokerUrl } = req.body;
            const connected = await this.mqttService.connect(brokerUrl);
            if (connected) {
                return res.status(200).json({
                    success: true,
                    message: 'MQTT connection established successfully'
                });
            }
            else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to connect to MQTT broker'
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
    /**
     * Subscribe to a specific topic
     */
    async subscribeTopic(req, res) {
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
            }
            else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to subscribe to topic'
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
    /**
     * Subscribe to all device topics
     */
    async subscribeAllDevices(req, res) {
        try {
            await this.mqttService.subscribeToAllDevices();
            return res.status(200).json({
                success: true,
                message: 'Subscribed to all device topics'
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
    /**
     * Publish message to a topic
     */
    async publishMessage(req, res) {
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
            }
            else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to publish message'
                });
            }
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
