"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mqtt_controller_1 = require("../controllers/mqtt.controller");
// import { DataSource } from 'typeorm';
// import { AuthMiddleware } from '../middlewares/auth.middleware';
const config_1 = require("../config");
const router = (0, express_1.Router)();
const mqttController = new mqtt_controller_1.MqttController(config_1.AppDataSource);
//   const authMiddleware = new AuthMiddleware(dataSource);
// Apply authentication middleware to all routes
//   router.use(authMiddleware.authenticate);
// MQTT connection routes
router.post('/connect', mqttController.initMqttConnection);
router.post('/subscribe', mqttController.subscribeTopic);
router.post('/subscribe-all', mqttController.subscribeAllDevices);
router.post('/publish', mqttController.publishMessage);
exports.default = router;
