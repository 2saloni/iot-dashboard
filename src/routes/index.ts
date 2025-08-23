import { Router } from 'express';
import authRoutes from './auth.routes';
// import mqttRoutes from './mqtt.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
// router.use('/mqtt', mqttRoutes);

export default router;
