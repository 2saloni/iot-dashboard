import { Router } from 'express';
import { MqttController } from '../controllers/mqtt.controller';
// import { DataSource } from 'typeorm';
// import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config';


const router = Router();
const mqttController = new MqttController(AppDataSource);
//   const authMiddleware = new AuthMiddleware(dataSource);

// Apply authentication middleware to all routes
//   router.use(authMiddleware.authenticate);

// MQTT connection routes
router.post('/connect', mqttController.initMqttConnection);
router.post('/subscribe', mqttController.subscribeTopic);
router.post('/subscribe-all', mqttController.subscribeAllDevices);
router.post('/publish', mqttController.publishMessage);

export default router;
