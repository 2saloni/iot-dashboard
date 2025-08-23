import { Router } from 'express';
import authRoutes from './auth.routes';
import mqttRoutes from './mqtt.routes';
import deviceRoutes from './device.routes';

const router: Router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/mqtt', mqttRoutes);
router.use('/devices', deviceRoutes);

export default router;
