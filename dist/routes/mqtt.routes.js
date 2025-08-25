"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mqtt_controller_1 = require("../controllers/mqtt.controller");
const router = (0, express_1.Router)();
const mqttController = new mqtt_controller_1.MqttController();
// MQTT service routes
router.post('/start', mqttController.startMqttService);
router.get('/data/:deviceId', mqttController.getDeviceData);
exports.default = router;
