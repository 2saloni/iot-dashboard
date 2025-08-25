import { Router } from 'express';
import { MqttController } from '../controllers/mqtt.controller';

const router = Router();
const mqttController = new MqttController();

// MQTT service routes
router.post('/start', mqttController.startMqttService);
router.get('/data/:deviceId', mqttController.getDeviceData);

export default router;
